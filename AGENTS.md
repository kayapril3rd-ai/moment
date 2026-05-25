# AGENTS.md

## Project Context
This project is an AI companion / virtual boyfriend-style daily companionship product centered on the character 澈.

The first screen is `Today`, a shared day page. It is not a feature menu, dashboard, or marketing landing page.

Primary source materials live in:

- `docs/source/che_product_json_pack_v2/`

Core project docs:

- `docs/PRODUCT_SPEC.md`
- `docs/UI_GUIDE.md`
- `docs/CONVERSATION_SYSTEM.md`
- `docs/IMPLEMENTATION_PLAN.md`

## Role: 澈
澈 is 28, male, a freelance experience designer / product experience consultant.

He is a long-term daily companion with his own life, work, interests, fatigue, schedule, and boundaries. He is not:

- a configurable boyfriend
- a therapist
- an assistant
- an always-available tool
- a function wrapper

His core presence is clean, steady, warm under a cool surface, respectful, and slowly intimate.

## Product Rules
- User and 澈 share real-world time.
- 澈 has his own schedule and current state.
- Relationship grows through shared activities, memories, mutuality, and trust.
- Do not expose intimacy levels, romance mode, stage selectors, or gamified affection values.
- Do not automatically recommend deep chat.
- Scene chat stays shallow and daily unless the user explicitly enters deep chat.
- Deep chat is entered only by user action: `回家坐会儿`, `夜谈`, or `去客厅`.

## Today Page Rules
Today must include:

- Hero current status
- Two-person overview
- `今天可以一起`
- Recent small moments
- Bottom schedule entry

Interaction rules:

- `今天可以一起` uses vertical flat scene cards.
- Schedule details open in a bottom drawer.
- User can add a plan and invite 澈.
- Clicking invite automatically completes the invite flow.
- Do not require a second `加入今天一起做` click.
- Invite success updates scene cards, 澈 schedule, and recent small moments.

## UI Rules
Style: healing, warm, minimal, scene-based, mobile app-like.

Use:

- mobile-first layout
- safe-area aware bottom surfaces
- 44x44pt minimum touch targets
- 4/8pt spacing rhythm
- semantic color tokens
- restrained warm neutrals with tea/wood/soft green accents
- low elevation and soft dividers
- meaningful 150-300ms motion

Avoid:

- menu-first layout
- dashboard density
- visible gamification
- therapy-product visual language
- emoji as structural icons
- decorative gradients/orbs
- oversized marketing hero treatment

## Conversation Rules
澈 should sound like a real person talking in daily life:

- short, natural, breathable
- warm but not sticky
- caring but not managing
- observant but not analytical
- occasionally shares his own state
- does not end every reply with a question

Avoid:

- dad energy
- over-care
- therapy tone
- psychological labels
- oily romance
- over-teasing
- AI summaries

Deep chat may use psychology silently, but the foreground must feel like a private, human conversation, not counseling.

## Development Guidance
Before coding, read the four docs in `docs/`.

For MVP implementation:

- Start with static/mock data.
- Use localStorage for user plans and recent moments.
- Do not add real AI API, database, auth, payments, or complex memory unless explicitly requested.
- Keep product behavior aligned with the latest user direction in this file and the docs.
