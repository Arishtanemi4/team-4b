"""
Team-level dashboard data preparation — "Team Pulse & Performance".

Each function takes a `team_id` and returns the exact payload a frontend card
needs to render itself for that team. No rendering logic here.

Data schema (long format):
    rater, team, individual, survey, metric, value, team_number, individual_id
    - 25 teams × 5 members × 5 surveys
    - `metric` is a categorical name (e.g. 'Wellbeing', 'Solution Fit')
    - `value` is 0..100 on a Likert-slider scale
    - Survey 1 is pre-work; surveys 2–5 are during/after-work waves.

Note on reverse-coding (different from the portfolio dashboard):
    The portfolio dashboard reverse-codes Cognitive Load at load time so all
    downstream logic reads "higher is better". This team dashboard does NOT —
    cards like the Cognitive Load tile and the "Our Stress Level" sparkline
    want to show the *raw* value (higher = more stress, which is bad). The
    smiley/trend logic is inverted per-card instead.
"""

from __future__ import annotations
import pandas as pd


# =============================================================================
# Configuration
# =============================================================================

_DEFAULT_PATH = 'dashboard_data.csv'

# Raw-scale bands on 0..100. For metrics where "higher = good".
# Same thresholds as the portfolio dashboard to keep the two coherent.
GREEN_THRESHOLD = 60
AMBER_THRESHOLD = 45

# "Stress" / Cognitive Load card. Because high = bad, the bands invert:
#   value <= COG_LOAD_GREEN → 'green'
#   COG_LOAD_GREEN < value <= COG_LOAD_AMBER → 'amber'
#   value > COG_LOAD_AMBER → 'red'
COG_LOAD_GREEN = 45
COG_LOAD_AMBER = 65

# Smallest wave-over-wave change that counts as a "Rising"/"Falling" label.
TREND_EPSILON = 2.0

# Which metrics are "behaviour" vs "solution" — used by Strengths & Gaps and
# by the "How Strong Is Our Solution?" card.
BEHAVIOUR_METRICS = [
    'Wellbeing', 'Team Access', 'Productivity',
    'Capacity', 'Capability', 'Collaboration',
    'Psych. Safety', 'Cognitive Load',
    'Priorities', 'Leadership',
]

SOLUTION_METRICS = [
    'Solution Fit', 'Innovation', 'Ambition',
    'Commercial App.', 'Beneficial', 'Presentation',
]

# Display-friendly renames for the Strengths & Gaps list. Anything not in this
# map will be shown verbatim.
METRIC_DISPLAY_NAMES = {
    'Psych. Safety':  'Psychological Safety',
    'Cognitive Load': 'Managing Workload',
    'Capability':     'Skills & Capability',
    'Team Access':    'Access to Information',
}

# Sad → happy thresholds for the "How We're Feeling" (wellbeing) smiley.
#   raw value ≥ WELLBEING_GOOD → 'Good'
#   WELLBEING_OK ≤ value < GOOD → 'OK'
#   value < OK → 'Low'
WELLBEING_GOOD = 60
WELLBEING_OK   = 45


# =============================================================================
# Shared helpers
# =============================================================================

def _load(path: str | None = None) -> pd.DataFrame:
    """Plain loader. No reverse-coding — that's done per-card where needed."""
    return pd.read_csv(path or _DEFAULT_PATH)


def _team_df(df: pd.DataFrame, team_id: int) -> pd.DataFrame:
    """Filter to a single team; raise if the team isn't present."""
    t = df[df['team'] == team_id]
    if t.empty:
        available = sorted(int(x) for x in df['team'].unique())
        raise ValueError(f'team_id {team_id} not found in data. '
                         f'Available teams: {available}')
    return t


def _latest_survey(team_df: pd.DataFrame) -> int:
    return int(team_df['survey'].max())


def _prev_survey(team_df: pd.DataFrame) -> int | None:
    surveys = sorted(team_df['survey'].unique())
    return int(surveys[-2]) if len(surveys) >= 2 else None


def _metric_value(team_df: pd.DataFrame, survey: int, metric: str) -> float | None:
    """Team-mean (across 5 members) for a given survey+metric, or None if absent."""
    sub = team_df[(team_df['survey'] == survey) & (team_df['metric'] == metric)]
    return float(sub['value'].mean()) if not sub.empty else None


def _trend_word(delta: float | None, high_is_bad: bool = False,
                eps: float = TREND_EPSILON) -> str:
    """
    Convert a numeric delta into a UX-friendly trend word.

    For "higher = better" metrics:        up → 'Rising', down → 'Falling'
    For "higher = bad" metrics (e.g. cognitive load) the words are the same
    but their *meaning* for the user is inverted — the smiley handles that.
    """
    if delta is None:
        return 'New'
    if delta > eps:
        return 'Rising'
    if delta < -eps:
        return 'Falling'
    return 'Stable'


def _smiley(value: float, high_is_bad: bool) -> str:
    """Return one of 'happy' / 'neutral' / 'sad' from a raw 0..100 value."""
    if high_is_bad:
        if value <= COG_LOAD_GREEN:
            return 'happy'
        if value <= COG_LOAD_AMBER:
            return 'neutral'
        return 'sad'
    else:
        if value >= GREEN_THRESHOLD:
            return 'happy'
        if value >= AMBER_THRESHOLD:
            return 'neutral'
        return 'sad'


def _status_phrase(value: float, high_is_bad: bool) -> str:
    """Short text label under the big number."""
    if high_is_bad:
        if value <= COG_LOAD_GREEN:
            return 'Healthy'
        if value <= COG_LOAD_AMBER:
            return 'Watch'
        return 'Rising'     # default phrase shown in the mock
    else:
        if value >= GREEN_THRESHOLD:
            return 'Strong'
        if value >= AMBER_THRESHOLD:
            return 'Needs support'
        return 'Critical'


def _display_name(metric: str) -> str:
    return METRIC_DISPLAY_NAMES.get(metric, metric)


# =============================================================================
# 1. Wellbeing  (top-left KPI — categorical label + smiley)
# =============================================================================

def wellbeing(team_id: int, path: str | None = None) -> dict:
    """
    Current team wellbeing as a categorical label + smiley + raw value.

    Returns
    -------
    {
        'label': 'Good' | 'OK' | 'Low',
        'value': float,            # team-mean on latest survey, 0..100
        'smiley': 'happy' | 'neutral' | 'sad',
        'survey': int,             # which survey this came from
    }
    """
    df = _load(path)
    team_df = _team_df(df, team_id)
    latest = _latest_survey(team_df)
    value = _metric_value(team_df, latest, 'Wellbeing')
    if value is None:
        return {'label': 'N/A', 'value': None, 'smiley': 'neutral', 'survey': latest}

    if value >= WELLBEING_GOOD:
        label, smiley = 'Good', 'happy'
    elif value >= WELLBEING_OK:
        label, smiley = 'OK', 'neutral'
    else:
        label, smiley = 'Low', 'sad'

    return {
        'label': label,
        'value': round(value, 0),
        'smiley': smiley,
        'survey': latest,
    }


# =============================================================================
# 2. Team Access  (top-middle KPI — numeric + status phrase)
# =============================================================================

def team_access(team_id: int, path: str | None = None) -> dict:
    """
    Team Access score on the latest survey (number + status phrase + smiley).

    Returns
    -------
    {
        'value': int,                             # team-mean, 0..100, rounded
        'status': 'Strong' | 'Needs support' | 'Critical',
        'smiley': 'happy' | 'neutral' | 'sad',
        'survey': int,
    }
    """
    df = _load(path)
    team_df = _team_df(df, team_id)
    latest = _latest_survey(team_df)
    value = _metric_value(team_df, latest, 'Team Access')
    if value is None:
        return {'value': None, 'status': 'N/A', 'smiley': 'neutral', 'survey': latest}

    return {
        'value': int(round(value, 0)),
        'status': _status_phrase(value, high_is_bad=False),
        'smiley': _smiley(value, high_is_bad=False),
        'survey': latest,
    }


# =============================================================================
# 3. Cognitive Load  (top-right KPI — numeric + trend word)
# =============================================================================

def cognitive_load(team_id: int, path: str | None = None) -> dict:
    """
    Cognitive Load on the latest survey (number + trend word + smiley).

    Note: this card shows the RAW value where high = bad. The smiley and
    status-phrase logic is inverted accordingly.

    Returns
    -------
    {
        'value': int,                             # raw value on 0..100; higher = worse
        'trend': 'Rising' | 'Falling' | 'Stable' | 'New',
        'delta': float,                           # current - previous, or None
        'smiley': 'happy' | 'neutral' | 'sad',
        'status': 'Healthy' | 'Watch' | 'Rising',
        'survey': int,
    }
    """
    df = _load(path)
    team_df = _team_df(df, team_id)
    latest = _latest_survey(team_df)
    prev = _prev_survey(team_df)

    value = _metric_value(team_df, latest, 'Cognitive Load')
    prev_value = _metric_value(team_df, prev, 'Cognitive Load') if prev else None
    delta = (value - prev_value) if (value is not None and prev_value is not None) else None

    if value is None:
        return {'value': None, 'trend': 'N/A', 'delta': None,
                'smiley': 'neutral', 'status': 'N/A', 'survey': latest}

    return {
        'value': int(round(value, 0)),
        'trend': _trend_word(delta),
        'delta': round(delta, 1) if delta is not None else None,
        'smiley': _smiley(value, high_is_bad=True),
        'status': _status_phrase(value, high_is_bad=True),
        'survey': latest,
    }


# =============================================================================
# 4. Team Strengths & Gaps  (bottom-left card)
# =============================================================================

def strengths_gaps(team_id: int, path: str | None = None,
                   n_strengths: int = 2, n_gaps: int = 2) -> dict:
    """
    Top strengths and top gaps for the team on the latest survey, chosen
    relative to the team's own other metrics (so "strength" means stands out
    within *this team's* answers, not vs the rest of the portfolio).

    We use the team-mean z-score within the latest survey: compute each team
    member's z-score across all their own parameters in that survey, then
    average per metric across the five members. The metrics with the highest
    mean z-score are the strengths; lowest are the gaps.

    Returns
    -------
    {
        'strengths': [{'metric': str, 'display': str, 'value': float, 'z': float}, ...],
        'gaps':      [{'metric': str, 'display': str, 'value': float, 'z': float}, ...],
        'survey': int,
    }
    """
    df = _load(path)
    team_df = _team_df(df, team_id)
    latest = _latest_survey(team_df)

    # Work on behaviour metrics only — "we're great at collaboration" is the
    # kind of insight the card wants, not "we're great at solution innovation".
    ldf = team_df[(team_df['survey'] == latest)
                  & (team_df['metric'].isin(BEHAVIOUR_METRICS))].copy()

    # For cognitive-load-style "high = bad" items, flip so z-score framing is
    # consistent with "higher = stronger".
    ldf.loc[ldf['metric'] == 'Cognitive Load', 'value'] = (
        100 - ldf.loc[ldf['metric'] == 'Cognitive Load', 'value']
    )

    # Per-person z-score across their own metrics in this survey.
    def _z_within_person(group):
        mu = group['value'].mean()
        sd = group['value'].std(ddof=0)
        if sd == 0 or pd.isna(sd):
            group = group.assign(z=0.0)
        else:
            group = group.assign(z=(group['value'] - mu) / sd)
        return group

    ldf = ldf.groupby('rater', group_keys=False).apply(_z_within_person)

    # Team-mean z per metric, and raw value per metric for display.
    summary = ldf.groupby('metric').agg(z=('z', 'mean'), value=('value', 'mean'))
    # Flip Cognitive Load's raw display back to its original orientation (so the
    # card shows the actual cognitive-load number, not its reverse-coded version).
    if 'Cognitive Load' in summary.index:
        summary.loc['Cognitive Load', 'value'] = 100 - summary.loc['Cognitive Load', 'value']

    summary = summary.sort_values('z', ascending=False)

    def _pack(rows):
        return [{
            'metric': m,
            'display': _display_name(m),
            'value': float(round(r['value'], 1)),
            'z': float(round(r['z'], 2)),
        } for m, r in rows.iterrows()]

    return {
        'strengths': _pack(summary.head(n_strengths)),
        'gaps':      _pack(summary.tail(n_gaps).iloc[::-1]),
        'survey': latest,
    }


# =============================================================================
# 5. Team Mood Tracker  (bottom-middle — two sparklines)
# =============================================================================

def mood_tracker(team_id: int, path: str | None = None) -> dict:
    """
    Two time-series for the Team Mood Tracker sparklines:
        - 'feeling'  : team-mean Wellbeing across all available surveys
        - 'stress'   : team-mean Cognitive Load across all available surveys
                       (RAW — higher means more stress)

    Returns
    -------
    {
        'feeling': {
            'label': 'How We\\'re Feeling',
            'points': [{'survey': int, 'value': float}, ...],
        },
        'stress': {
            'label': 'Our Stress Level',
            'points': [{'survey': int, 'value': float}, ...],
        },
    }
    """
    df = _load(path)
    team_df = _team_df(df, team_id)
    surveys = sorted(team_df['survey'].unique())

    def _series(metric: str) -> list[dict]:
        pts = []
        for s in surveys:
            v = _metric_value(team_df, s, metric)
            if v is not None:
                pts.append({'survey': int(s), 'value': round(v, 1)})
        return pts

    return {
        'feeling': {
            'label': "How We're Feeling",
            'points': _series('Wellbeing'),
        },
        'stress': {
            'label': 'Our Stress Level',
            'points': _series('Cognitive Load'),
        },
    }


# =============================================================================
# 6. How Strong Is Our Solution?  (bottom-right)
# =============================================================================

def solution_strength(team_id: int, path: str | None = None) -> dict:
    """
    Categorical verdict on the team's solution, based on the mean of the
    solution-related metrics available on the latest survey.

    The solution metrics land incrementally across surveys (Innovation/
    Solution Fit/Ambition from S2, Commercial/Beneficial from S3, Presentation
    from S5) — we just average whichever are present on the latest survey.

    Returns
    -------
    {
        'label': 'Strong & Innovative' | 'Coming Together' | 'Needs Work' | 'Too Early',
        'value': float | None,    # mean of available solution metrics, 0..100
        'band': 'green' | 'amber' | 'red' | 'unknown',
        'survey': int,
        'contributing_metrics': [str, ...],  # which solution metrics fed the score
    }
    """
    df = _load(path)
    team_df = _team_df(df, team_id)
    latest = _latest_survey(team_df)

    ldf = team_df[(team_df['survey'] == latest)
                  & (team_df['metric'].isin(SOLUTION_METRICS))]

    if ldf.empty:
        # Surveys 1 has no solution metrics at all — card shows 'Too Early'.
        return {
            'label': 'Too Early',
            'value': None,
            'band': 'unknown',
            'survey': latest,
            'contributing_metrics': [],
        }

    value = float(ldf['value'].mean())
    contributing = sorted(ldf['metric'].unique().tolist())

    if value >= GREEN_THRESHOLD:
        label, band = 'Strong & Innovative', 'green'
    elif value >= AMBER_THRESHOLD:
        label, band = 'Coming Together', 'amber'
    else:
        label, band = 'Needs Work', 'red'

    return {
        'label': label,
        'value': round(value, 1),
        'band': band,
        'survey': latest,
        'contributing_metrics': contributing,
    }
