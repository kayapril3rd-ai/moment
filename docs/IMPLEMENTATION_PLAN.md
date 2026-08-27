# Implementation Plan

## Current Task Status
This round initializes context and documentation only.

No page code should be written in this round.

Completed:

- extracted source JSON package
- read all JSON files
- synthesized product rules
- synthesized UI/UX rules
- synthesized conversation rules
- created project docs

## MVP Strategy
Build a mobile-first static/mock prototype first.

Recommended sequence:

1. App shell and design tokens
2. Today page static layout
3. Schedule bottom drawer
4. Add plan + invite 澈 flow
5. Scene chat mock flow
6. Deep chat explicit-entry flow
7. Recent moments and hidden relationship mock state
8. LocalStorage persistence
9. QA pass against product, UI, and conversation rules

## Phase 1: Foundation
Create the app foundation without real AI.

Tasks:

- define route/page structure
- define semantic color, spacing, typography, radius, shadow, and motion tokens
- create mock data files
- create localStorage helpers
- define shared types for status, plans, schedule, scene cards, recent moments, and hidden relationship state

Do not add:

- database
- auth
- real AI API
- payment
- multi-character architecture

## Phase 2: Today Page
Build `Today` as the default first screen.

Sections:

- Hero current status
- Two-person overview
- 今天可以一起 vertical scene cards
- 最近小片段
- bottom schedule entry

Acceptance criteria:

- does not look like a feature menu
- shows 澈's current state and life rhythm
- supports small phone viewport without horizontal scroll
- scene cards are vertical and flat
- recent moments show relationship through concrete fragments, not metrics

## Phase 3: Schedule Drawer
Implement bottom drawer schedule details.

Features:

- view user plans
- view 澈 schedule
- view shared plans
- add plan
- invite 澈

Acceptance criteria:

- drawer respects safe area
- touch targets are at least 44x44pt
- inviting 澈 completes immediately
- no second `加入今天一起做` click
- success updates Today scene cards, 澈 schedule, and recent moments

## Phase 4: Scene Chat
Implement shallow scene chat with mock replies.

Required scene entries:

- 一起学习
- 一起看剧
- 一起健身
- 一起吃饭
- 一起打游戏
- 睡前聊会儿
- 下班路上
- 无事闲聊

Acceptance criteria:

- no automatic deep chat recommendation
- no emotion detection UI
- no therapy language
- reply examples follow the conversation system
- 澈 may share his own state when appropriate

## Phase 5: Deep Room
Implement explicit deep-chat entry.

Entry labels:

- 回家坐会儿
- 夜谈
- 去客厅

Acceptance criteria:

- only user action opens deep room
- no automatic routing from scene chat
- copy feels private and human, not clinical
- mock replies receive first, then gently look at one concrete point

## Phase 6: Memory and Relationship Mock
Implement hidden relationship state and frontstage memories.

Internal only:

- familiarity
- dailyBond
- trust
- mutuality
- tension

Frontstage:

- remembered small things
- shared activities
- today fragments
- 澈's interests and schedule mentions

Acceptance criteria:

- no visible levels or points
- recent moments update after invite and scene activity
- future scene suggestions can use hidden state without exposing it

## Data Draft
Suggested files when implementation starts:

- `src/data/mockCheStatus.ts`
- `src/data/mockCheSchedule.ts`
- `src/data/mockScenes.ts`
- `src/data/mockMoments.ts`
- `src/types/che.ts`
- `src/lib/storage.ts`

Suggested types:

- `CheStatus`
- `UserPlan`
- `CheScheduleItem`
- `SceneCard`
- `RecentMoment`

## QA Checklist
Before any implementation is considered done:

- Today is the first screen.
- Today is not a menu.
- 澈 has his own current state and schedule.
- User and 澈 share real time.
- Scene chat stays shallow.
- Deep chat starts only by explicit user click.
- No automatic deep chat recommendation exists.
- Invite flow completes in one click.
- Invite success updates scene cards, schedule, and recent moments.
- No intimacy levels or romance mode are visible.
- UI is warm, minimal, mobile-first, and scene-based.
- Touch targets, safe areas, contrast, and reduced motion are handled.

## Next Development Plan
Next coding round should start with Phase 1 and Phase 2 only:

1. inspect the existing repo stack
2. create design tokens and mock data
3. build the Today page static layout
4. add a non-persistent static schedule drawer
5. verify mobile layout before adding interactions
