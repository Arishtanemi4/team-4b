"""
Dashboard data preparation for the HCD Portfolio Action Console.

Each function loads `dashboard_data.csv` and returns the exact payload a
frontend card needs to render itself — no rendering logic here.

Data schema (long format):
    rater, team, individual, survey, metric, value, team_number, individual_id
    - 25 teams × 5 members × 5 surveys
    - `metric` is a categorical name (e.g. 'Wellbeing', 'Solution Fit')
    - `value` is 0..100 on a Likert-slider scale
    - Survey 1 is pre-work; surveys 2–5 are during/after-work waves.

All functions accept a `path` argument so they can be pointed at another file,
and default to 'dashboard_data.csv' in the working directory.
"""

from __future__ import annotations
import os
import pandas as pd


# =============================================================================
# Configuration — the semantic grouping of metrics
# =============================================================================

# Behavioural health: how the team is functioning as a working unit.
BEHAVIOUR_METRICS = [
    'Wellbeing', 'Team Access', 'Productivity',
    'Capacity', 'Capability', 'Collaboration',
    'Psych. Safety', 'Cognitive Load',
    'Priorities', 'Leadership',
]

# Delivery confidence: how the solution is coming along.
DELIVERY_METRICS = [
    'Solution Fit', 'Innovation', 'Ambition',
    'Commercial App.', 'Beneficial', 'Presentation',
]

# Metrics where high = bad. We reverse-code these so "higher is better" holds uniformly.
# Kept separate from value-vs-risk banding so we can be explicit everywhere.
REVERSED_METRICS = {'Cognitive Load'}

# Heatmap metrics shown in the mock (subset of behaviour metrics).
HEATMAP_METRICS = [
    'Wellbeing', 'Team Access', 'Productivity',
    'Capacity', 'Collaboration', 'Psych. Safety', 'Cognitive Load',
]

# Risk-band thresholds on the 0..100 "higher is better" scale.
#   value >= GREEN_THRESHOLD       → 'green'
#   AMBER_THRESHOLD <= value < GREEN  → 'amber'
#   value < AMBER_THRESHOLD        → 'red'
GREEN_THRESHOLD = 60
AMBER_THRESHOLD = 45

# A team "needs support" if its latest-survey behaviour health is below this.
SUPPORT_THRESHOLD = 50

# "Trending down" = latest-wave score dropped by at least this much vs the prior wave.
TRENDING_DOWN_DELTA = 3.0

# For `alert()`: how large a wave-over-wave drop or gain counts as a "notable event"?
ALERT_DROP_DELTA = 5.0
ALERT_RECOVERY_DELTA = 5.0


# =============================================================================
# Shared helpers
# =============================================================================

_DEFAULT_PATH = 'dashboard_data.csv'


def _load(path: str | None = None) -> pd.DataFrame:
    """Load the CSV and normalise reverse-coded metrics so higher = better."""
    path = path or _DEFAULT_PATH
    df = pd.read_csv(path)
    # Reverse-code any "high = bad" metrics so every value reads as "higher = better".
    # This keeps all downstream aggregation logic uniform.
    df.loc[df['metric'].isin(REVERSED_METRICS), 'value'] = (
        100 - df.loc[df['metric'].isin(REVERSED_METRICS), 'value']
    )
    return df


def _latest_survey(df: pd.DataFrame) -> int:
    return int(df['survey'].max())


def _team_label(team_id: int) -> str:
    """Human-friendly team label. Frontend can override with a mapping if desired."""
    return f'Team {team_id}'


def _band(value: float) -> str:
    """Return 'green' / 'amber' / 'red' for a 0..100 value."""
    if pd.isna(value):
        return 'unknown'
    if value >= GREEN_THRESHOLD:
        return 'green'
    if value >= AMBER_THRESHOLD:
        return 'amber'
    return 'red'


def _trend_arrow(delta: float, eps: float = 1.0) -> str:
    """Map a change to one of three arrow directions."""
    if delta > eps:
        return 'up'
    if delta < -eps:
        return 'down'
    return 'flat'


def _team_score(df: pd.DataFrame, team: int, survey: int, metrics: list[str]) -> float | None:
    """Mean value for a (team, survey, metric-subset), or None if no data."""
    sub = df[(df['team'] == team) & (df['survey'] == survey) & (df['metric'].isin(metrics))]
    return float(sub['value'].mean()) if not sub.empty else None


def _portfolio_score(df: pd.DataFrame, survey: int, metrics: list[str]) -> float | None:
    """Portfolio-wide mean across all teams for a (survey, metric-subset)."""
    sub = df[(df['survey'] == survey) & (df['metric'].isin(metrics))]
    return float(sub['value'].mean()) if not sub.empty else None


# =============================================================================
# 1. Teams Needing Support  (top-left KPI)
# =============================================================================

def need_support(path: str | None = None) -> dict:
    """
    Number of teams with low behaviour health on the latest survey, plus whether
    that count is rising or falling vs the previous survey.

    Returns
    -------
    {
        'count': int,                       # teams flagged as needing support *now*
        'previous_count': int,              # same flag one survey ago
        'trend': 'up' | 'down' | 'flat',    # direction of the count (up = more teams struggling)
        'threshold': float,                 # behaviour health below which a team is flagged
        'teams': [int, ...],                # team IDs currently flagged
    }
    """
    df = _load(path)
    latest = _latest_survey(df)
    prev = latest - 1

    def flagged(survey: int) -> list[int]:
        teams = []
        for t in sorted(df['team'].unique()):
            score = _team_score(df, t, survey, BEHAVIOUR_METRICS)
            if score is not None and score < SUPPORT_THRESHOLD:
                teams.append(int(t))
        return teams

    now_teams = flagged(latest)
    prev_teams = flagged(prev) if prev >= 1 else []

    return {
        'count': len(now_teams),
        'previous_count': len(prev_teams),
        'trend': _trend_arrow(len(now_teams) - len(prev_teams)),
        'threshold': SUPPORT_THRESHOLD,
        'teams': now_teams,
    }


# =============================================================================
# 2. Teams Trending Down  (second KPI)
# =============================================================================

def team_trend(path: str | None = None) -> dict:
    """
    Teams whose overall (behaviour + delivery) score dropped meaningfully on the
    latest survey vs the previous survey.

    Returns
    -------
    {
        'count': int,                       # teams trending down right now
        'previous_count': int,              # teams trending down one wave ago
        'trend': 'up' | 'down' | 'flat',    # direction of the *count* (up = more teams slipping)
        'delta_threshold': float,           # drop required (score points) to count as trending down
        'teams': [{'team': int, 'current': float, 'previous': float, 'delta': float}, ...],
    }
    """
    df = _load(path)
    latest = _latest_survey(df)
    prev = latest - 1
    prev_prev = latest - 2

    all_metrics = BEHAVIOUR_METRICS + DELIVERY_METRICS

    def trending_down_between(s_from: int, s_to: int) -> list[dict]:
        result = []
        for t in sorted(df['team'].unique()):
            a = _team_score(df, t, s_from, all_metrics)
            b = _team_score(df, t, s_to, all_metrics)
            if a is None or b is None:
                continue
            delta = b - a
            if delta <= -TRENDING_DOWN_DELTA:
                result.append({
                    'team': int(t),
                    'current': round(b, 1),
                    'previous': round(a, 1),
                    'delta': round(delta, 1),
                })
        return result

    now = trending_down_between(prev, latest) if prev >= 1 else []
    earlier = trending_down_between(prev_prev, prev) if prev_prev >= 1 else []

    return {
        'count': len(now),
        'previous_count': len(earlier),
        'trend': _trend_arrow(len(now) - len(earlier)),
        'delta_threshold': TRENDING_DOWN_DELTA,
        'teams': now,
    }


# =============================================================================
# 3. Avg Behaviour Health  (third KPI)
# =============================================================================

def avg_health(path: str | None = None) -> dict:
    """
    Portfolio-wide average behaviour health on the latest survey, with
    comparison arrow vs the previous survey.

    Returns
    -------
    {
        'value': float,                     # portfolio mean, 0..100, rounded
        'previous': float,                  # same mean one survey ago
        'delta': float,                     # current - previous
        'trend': 'up' | 'down' | 'flat',
        'band': 'green' | 'amber' | 'red',  # colour for the big number
    }
    """
    df = _load(path)
    latest = _latest_survey(df)
    prev = latest - 1

    now_val = _portfolio_score(df, latest, BEHAVIOUR_METRICS)
    prev_val = _portfolio_score(df, prev, BEHAVIOUR_METRICS) if prev >= 1 else None

    delta = (now_val - prev_val) if (now_val is not None and prev_val is not None) else 0.0

    return {
        'value': round(now_val, 0) if now_val is not None else None,
        'previous': round(prev_val, 0) if prev_val is not None else None,
        'delta': round(delta, 1),
        'trend': _trend_arrow(delta),
        'band': _band(now_val) if now_val is not None else 'unknown',
    }


# =============================================================================
# 4. Avg Delivery Confidence  (fourth KPI)
# =============================================================================

def del_conf(path: str | None = None) -> dict:
    """
    Portfolio-wide average delivery confidence on the latest survey, with
    comparison arrow vs the previous survey.

    Returns
    -------
    {
        'value': float | None,              # None if delivery metrics aren't in the latest survey
        'previous': float | None,
        'delta': float,
        'trend': 'up' | 'down' | 'flat',
        'band': 'green' | 'amber' | 'red',
    }
    """
    df = _load(path)
    latest = _latest_survey(df)
    prev = latest - 1

    now_val = _portfolio_score(df, latest, DELIVERY_METRICS)
    prev_val = _portfolio_score(df, prev, DELIVERY_METRICS) if prev >= 1 else None

    delta = (now_val - prev_val) if (now_val is not None and prev_val is not None) else 0.0

    return {
        'value': round(now_val, 0) if now_val is not None else None,
        'previous': round(prev_val, 0) if prev_val is not None else None,
        'delta': round(delta, 1),
        'trend': _trend_arrow(delta),
        'band': _band(now_val) if now_val is not None else 'unknown',
    }


# =============================================================================
# 5. Send Support Now  (left table)
# =============================================================================

# Metric → (human-readable issue phrase, recommended action, display priority if low)
_SUPPORT_ISSUE_TEMPLATES = {
    'Psych. Safety':   ('Low Psychological Safety',  'Facilitate a safe retro', 'High'),
    'Cognitive Load':  ('High Cognitive Load',       'Descope non-essentials', 'Med'),
    'Team Access':     ('Access Problems',           'Unblock tooling / access', 'High'),
    'Wellbeing':       ('Low Wellbeing',             'Check in with team',     'Med'),
    'Leadership':      ('Weak Leadership Signal',    'Coach team lead',        'Med'),
    'Collaboration':   ('Collaboration Breaking',    'Run alignment session',  'High'),
    'Capacity':        ('Capacity Shortfall',        'Reallocate support',     'Med'),
    'Capability':      ('Capability Gap',            'Pair with SME',          'Med'),
    'Priorities':      ('Unclear Priorities',        'Rework priority list',   'High'),
    'Productivity':    ('Productivity Slump',        'Diagnose blockers',      'Med'),
}


def send_support(path: str | None = None, top_n: int = 5) -> list[dict]:
    """
    Teams most in need of intervention, with the specific issue and suggested action.

    For each team, we find the behaviour metric with the lowest latest-survey
    score and map it to an issue/action using `_SUPPORT_ISSUE_TEMPLATES`. Only
    teams whose worst metric is in the red band (< AMBER_THRESHOLD) are returned.

    Returns
    -------
    [
        {
            'team': int,
            'team_label': str,
            'priority': 'High' | 'Med',
            'issue': str,
            'action': str,
            'worst_metric': str,
            'worst_value': float,
        },
        ...
    ]
    Ordered by worst_value ascending (most urgent first), truncated to `top_n`.
    """
    df = _load(path)
    latest = _latest_survey(df)

    rows = []
    for t in sorted(df['team'].unique()):
        team_latest = df[(df['team'] == t) & (df['survey'] == latest)
                         & (df['metric'].isin(BEHAVIOUR_METRICS))]
        if team_latest.empty:
            continue
        per_metric = team_latest.groupby('metric')['value'].mean()
        worst_metric = per_metric.idxmin()
        worst_value = float(per_metric.min())

        # Only surface teams whose worst metric is actually in red territory.
        if worst_value >= AMBER_THRESHOLD:
            continue

        template = _SUPPORT_ISSUE_TEMPLATES.get(
            worst_metric, (f'Low {worst_metric}', 'Investigate', 'Med')
        )
        issue, action, priority = template

        rows.append({
            'team': int(t),
            'team_label': _team_label(t),
            'priority': priority,
            'issue': issue,
            'action': action,
            'worst_metric': worst_metric,
            'worst_value': round(worst_value, 1),
        })

    rows.sort(key=lambda r: r['worst_value'])
    return rows[:top_n]


# =============================================================================
# 6. Team Status Heatmap  (centre grid)
# =============================================================================

def status_heatmap(path: str | None = None) -> dict:
    """
    Grid of teams × key behavioural metrics on the latest survey, each cell
    banded green/amber/red.

    Returns
    -------
    {
        'metrics': [str, ...],   # columns, in display order
        'teams': [                # rows
            {
                'team': int,
                'team_label': str,
                'cells': [
                    {'metric': str, 'value': float, 'band': 'green'|'amber'|'red'},
                    ...  # one per metric, in the same order as `metrics`
                ],
            },
            ...
        ],
        'survey': int,           # which survey the data came from
    }
    """
    df = _load(path)
    latest = _latest_survey(df)
    df_latest = df[df['survey'] == latest]

    teams_out = []
    for t in sorted(df['team'].unique()):
        cells = []
        for m in HEATMAP_METRICS:
            val_series = df_latest[(df_latest['team'] == t) & (df_latest['metric'] == m)]['value']
            val = float(val_series.mean()) if not val_series.empty else None
            cells.append({
                'metric': m,
                'value': round(val, 1) if val is not None else None,
                'band': _band(val) if val is not None else 'unknown',
            })
        teams_out.append({
            'team': int(t),
            'team_label': _team_label(t),
            'cells': cells,
        })

    return {
        'metrics': list(HEATMAP_METRICS),
        'teams': teams_out,
        'survey': latest,
    }


# =============================================================================
# 7. Performance Outlook  (right scatter)
# =============================================================================

def perf_outlook(path: str | None = None) -> dict:
    """
    2D scatter of (behaviour_health, delivery_confidence) per team on the
    latest survey, for the four-quadrant "Front Runners / High Risk Zone /
    Potential, Needs Support / [bottom-right]" chart.

    The frontend draws the quadrant dividers at (50, 50) by default; the exact
    divider values are returned so the UI can stay in sync with the logic here.

    Returns
    -------
    {
        'points': [
            {
                'team': int,
                'team_label': str,
                'behaviour_health': float,     # x
                'delivery_confidence': float,  # y
                'quadrant': 'front_runner' | 'high_risk' | 'potential' | 'delivering_despite',
            },
            ...
        ],
        'x_divider': float,   # 50
        'y_divider': float,   # 50
        'x_label': 'Behaviour Health',
        'y_label': 'Delivery Confidence',
    }
    """
    df = _load(path)
    latest = _latest_survey(df)

    x_mid, y_mid = 50.0, 50.0

    def quadrant(x: float, y: float) -> str:
        # Same axis conventions as the mock:
        #   x = Behaviour Health, y = Delivery Confidence
        #   top-left  (low x, high y)  → front_runner? No — mock shows front runner top-left,
        #                                  but that only makes sense if "front runner" means
        #                                  "delivering despite wobbly behaviour health".
        #   Re-reading the mock: top-left = Front Runners, top-right = High Risk Zone,
        #   bottom-left = Potential/Needs Support, bottom-right unlabelled (delivering_despite).
        # We'll honour that labelling exactly.
        high_y = y >= y_mid
        high_x = x >= x_mid
        if high_y and not high_x:   return 'front_runner'
        if high_y and high_x:       return 'high_risk'
        if not high_y and not high_x: return 'potential'
        return 'delivering_despite'

    points = []
    for t in sorted(df['team'].unique()):
        bh = _team_score(df, t, latest, BEHAVIOUR_METRICS)
        dc = _team_score(df, t, latest, DELIVERY_METRICS)
        if bh is None or dc is None:
            continue
        points.append({
            'team': int(t),
            'team_label': _team_label(t),
            'behaviour_health': round(bh, 1),
            'delivery_confidence': round(dc, 1),
            'quadrant': quadrant(bh, dc),
        })

    return {
        'points': points,
        'x_divider': x_mid,
        'y_divider': y_mid,
        'x_label': 'Behaviour Health',
        'y_label': 'Delivery Confidence',
    }


# =============================================================================
# 8. Alert Summary  (bottom list)
# =============================================================================

def alert(path: str | None = None, top_n: int = 10) -> list[dict]:
    """
    Notable events across the portfolio on the latest survey: sharp drops,
    sharp recoveries, and teams crossing into red.

    Returns
    -------
    [
        {
            'team': int,
            'team_label': str,
            'severity': 'critical' | 'warning' | 'info',
            'metric': str,
            'message': str,
            'current': float,
            'previous': float,
            'delta': float,
        },
        ...
    ]
    Ordered by severity (critical > warning > info) then by |delta| descending,
    truncated to `top_n`.
    """
    df = _load(path)
    latest = _latest_survey(df)
    prev = latest - 1
    if prev < 1:
        return []

    sev_order = {'critical': 0, 'warning': 1, 'info': 2}
    events: list[dict] = []

    for t in sorted(df['team'].unique()):
        for m in BEHAVIOUR_METRICS:
            now_series = df[(df['team'] == t) & (df['survey'] == latest) & (df['metric'] == m)]['value']
            prev_series = df[(df['team'] == t) & (df['survey'] == prev) & (df['metric'] == m)]['value']
            if now_series.empty or prev_series.empty:
                continue
            now_val = float(now_series.mean())
            prev_val = float(prev_series.mean())
            delta = now_val - prev_val

            severity = None
            message = None
            # Crossed into red territory this wave
            if now_val < AMBER_THRESHOLD <= prev_val:
                severity = 'critical'
                message = f'{m} dropped into red ({prev_val:.0f} → {now_val:.0f})'
            # Big drop but still above red
            elif delta <= -ALERT_DROP_DELTA:
                severity = 'warning'
                message = f'{m} fell by {abs(delta):.0f} points ({prev_val:.0f} → {now_val:.0f})'
            # Big recovery out of red
            elif prev_val < AMBER_THRESHOLD <= now_val:
                severity = 'info'
                message = f'{m} recovered to green/amber ({prev_val:.0f} → {now_val:.0f})'
            # Big positive move
            elif delta >= ALERT_RECOVERY_DELTA:
                severity = 'info'
                message = f'{m} improved by {delta:.0f} points ({prev_val:.0f} → {now_val:.0f})'

            if severity is not None:
                events.append({
                    'team': int(t),
                    'team_label': _team_label(t),
                    'severity': severity,
                    'metric': m,
                    'message': message,
                    'current': round(now_val, 1),
                    'previous': round(prev_val, 1),
                    'delta': round(delta, 1),
                })

    events.sort(key=lambda e: (sev_order[e['severity']], -abs(e['delta'])))
    return events[:top_n]

