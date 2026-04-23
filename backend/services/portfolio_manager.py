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

BEHAVIOUR_METRICS = [
    'Wellbeing', 'Team Access', 'Productivity',
    'Capacity', 'Capability', 'Collaboration',
    'Psych. Safety', 'Cognitive Load',
    'Priorities', 'Leadership',
]

DELIVERY_METRICS = [
    'Solution Fit', 'Innovation', 'Ambition',
    'Commercial App.', 'Beneficial', 'Presentation',
]

REVERSED_METRICS = {'Cognitive Load'}

HEATMAP_METRICS = [
    'Wellbeing', 'Team Access', 'Productivity',
    'Capacity', 'Collaboration', 'Psych. Safety', 'Cognitive Load',
]

GREEN_THRESHOLD = 60
AMBER_THRESHOLD = 45
SUPPORT_THRESHOLD = 50
TRENDING_DOWN_DELTA = 3.0
ALERT_DROP_DELTA = 5.0
ALERT_RECOVERY_DELTA = 5.0


# =============================================================================
# Shared helpers
# =============================================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

_DEFAULT_PATH = os.path.join(ROOT_DIR, 'db', 'dashboard_data.csv')

# Fixed filename spacing to match the DB folder exactly
_DEFAULT_MAPPING_PATH = os.path.join(ROOT_DIR, 'db', 'Anon link to Team name v01.xlsx')
_MAPPING_SHEET = 'Hack27 Teams'

_team_room_cache: dict[int, str] | None = None


def _load_team_room_mapping(path: str | None = None) -> dict[int, str]:
    global _team_room_cache
    if _team_room_cache is not None:
        return _team_room_cache

    mapping_path = path or _DEFAULT_MAPPING_PATH
    try:
        df = pd.read_excel(mapping_path, sheet_name=_MAPPING_SHEET)
    except (FileNotFoundError, ValueError) as e:
        print(f'[portfolio_manager] team-room mapping unavailable ({e}); '
              f'using "Team {{id}}" placeholders.')
        _team_room_cache = {}
        return _team_room_cache

    if 'Anon Team' not in df.columns or 'Team Room' not in df.columns:
        print(f'[portfolio_manager] mapping file missing expected columns; '
              f'using "Team {{id}}" placeholders.')
        _team_room_cache = {}
        return _team_room_cache

    usable = df.dropna(subset=['Anon Team', 'Team Room']).copy()
    usable['Anon Team'] = usable['Anon Team'].astype(int)
    usable['Team Room'] = usable['Team Room'].astype(str).str.strip()
    usable = usable[usable['Team Room'] != '']

    _team_room_cache = dict(zip(usable['Anon Team'], usable['Team Room']))
    return _team_room_cache


def _load(path: str | None = None) -> pd.DataFrame:
    path = path or _DEFAULT_PATH
    df = pd.read_csv(path)
    df.loc[df['metric'].isin(REVERSED_METRICS), 'value'] = (
        100 - df.loc[df['metric'].isin(REVERSED_METRICS), 'value']
    )
    return df


def _latest_survey(df: pd.DataFrame) -> int:
    return int(df['survey'].max())


def _team_label(team_id: int) -> str:
    mapping = _load_team_room_mapping()
    return mapping.get(int(team_id), f'Team {team_id}')


def _band(value: float) -> str:
    if pd.isna(value):
        return 'unknown'
    if value >= GREEN_THRESHOLD:
        return 'green'
    if value >= AMBER_THRESHOLD:
        return 'amber'
    return 'red'


def _trend_arrow(delta: float, eps: float = 1.0) -> str:
    if delta > eps:
        return 'up'
    if delta < -eps:
        return 'down'
    return 'flat'


def _team_score(df: pd.DataFrame, team: int, survey: int, metrics: list[str]) -> float | None:
    sub = df[(df['team'] == team) & (df['survey'] == survey) & (df['metric'].isin(metrics))]
    return float(sub['value'].mean()) if not sub.empty else None


def _portfolio_score(df: pd.DataFrame, survey: int, metrics: list[str]) -> float | None:
    sub = df[(df['survey'] == survey) & (df['metric'].isin(metrics))]
    return float(sub['value'].mean()) if not sub.empty else None


# =============================================================================
# 1. Teams Needing Support
# =============================================================================

def need_support(path: str | None = None) -> dict:
    df = _load(path)
    latest = _latest_survey(df)
    prev = latest - 1

    def flagged(survey: int) -> list[dict]:
        teams = []
        for t in sorted(df['team'].unique()):
            score = _team_score(df, t, survey, BEHAVIOUR_METRICS)
            if score is not None and score < SUPPORT_THRESHOLD:
                # Updated to provide the actual mapped label
                teams.append({'team': int(t), 'team_label': _team_label(t)})
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
# 2. Teams Trending Down
# =============================================================================

def team_trend(path: str | None = None) -> dict:
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
                    'team_label': _team_label(t), # Updated mapping
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
# 3. Avg Behaviour Health
# =============================================================================

def avg_health(path: str | None = None) -> dict:
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
# 4. Avg Delivery Confidence
# =============================================================================

def del_conf(path: str | None = None) -> dict:
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
# 5. Send Support Now
# =============================================================================

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
# 6. Team Status Heatmap
# =============================================================================

def status_heatmap(path: str | None = None) -> dict:
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
# 7. Performance Outlook
# =============================================================================

def perf_outlook(path: str | None = None) -> dict:
    df = _load(path)
    latest = _latest_survey(df)

    x_mid, y_mid = 50.0, 50.0

    def quadrant(x: float, y: float) -> str:
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
# 8. Alert Summary
# =============================================================================

def alert(path: str | None = None, top_n: int = 10) -> list[dict]:
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
            
            if now_val < AMBER_THRESHOLD <= prev_val:
                severity = 'critical'
                message = f'{m} dropped into red ({prev_val:.0f} → {now_val:.0f})'
            elif delta <= -ALERT_DROP_DELTA:
                severity = 'warning'
                message = f'{m} fell by {abs(delta):.0f} points ({prev_val:.0f} → {now_val:.0f})'
            elif prev_val < AMBER_THRESHOLD <= now_val:
                severity = 'info'
                message = f'{m} recovered to green/amber ({prev_val:.0f} → {now_val:.0f})'
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