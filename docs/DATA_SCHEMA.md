# Data Schema: 澈 MVP Mock Data

## Purpose
This document defines the MVP mock data schema for the 澈 daily companion product.

The first implementation should use static mock data and localStorage. Do not add a database or real AI API in MVP phase 1.

## Shared Types
### `SceneType`
Used to identify daily scene entries and link plans, scene cards, conversations, and moments.

| Field / Value | Type | Purpose | Example |
|---|---|---|---|
| `study` | string literal | 一起学习 | `"study"` |
| `watch` | string literal | 一起看剧 | `"watch"` |
| `fitness` | string literal | 一起健身 | `"fitness"` |
| `meal` | string literal | 一起吃饭 | `"meal"` |
| `gaming` | string literal | 一起打游戏 | `"gaming"` |
| `sleep` | string literal | 睡前聊会儿 | `"sleep"` |
| `commute` | string literal | 下班路上 | `"commute"` |
| `idle` | string literal | 无事闲聊 | `"idle"` |
| `deep_room` | string literal | 深入聊天入口，不属于普通场景聊天 | `"deep_room"` |

Example:

```json
"fitness"
```

### `ConversationMode`
Used to separate shallow scene chat from explicit deep chat.

| Field / Value | Type | Purpose | Example |
|---|---|---|---|
| `scene` | string literal | 普通场景聊天，浅层日常陪伴 | `"scene"` |
| `deep` | string literal | 用户主动进入后的深入聊天 | `"deep"` |

Example:

```json
"scene"
```

### Agent Scene Context

`SceneType` remains the stable UI/activity routing key. The AI Agent uses a separate,
coarser `AgentSceneKey` plus an extensible `SceneVariant`; these keys must not replace
the existing UI key.

| Field | Type | Purpose | Example |
|---|---|---|---|
| `sceneKey` | `AgentSceneKey` | Agent-level scene family | `"focus"` |
| `sceneVariant` | `SceneVariant` | Concrete setting within that family | `"work_desk"` |
| `cheCurrentState` | `string` (optional) | Runtime Che state, included only when an explicit current-state source provides it | `"他正在收尾体验评审稿。"` |

Reserved Agent families include `home_idle`, `focus`, `meal`, `fitness`, `errand`,
`commute`, `hangout`, and `deep_room`. Future contexts such as `errand / grocery`,
`hangout / park`, and `hangout / seaside` do not require a premature UI `SceneType`.
The centralized `AGENT_SCENE_BY_SCENE_TYPE` mapping is the source of truth; SceneData
does not duplicate this mapping. `cheStatusHint` is UI copy and is not a runtime
`cheCurrentState` source.

| SceneType | AgentSceneKey | SceneVariant |
|---|---|---|
| `study` | `focus` | `work_desk` |
| `watch` | `home_idle` | `movie_night` |
| `fitness` | `fitness` | `home_gym` |
| `meal` | `meal` | `cooking` |
| `gaming` | `home_idle` | `gaming_sofa` |
| `sleep` | `home_idle` | `bedside_night` |
| `commute` | `commute` | `city_evening` |
| `idle` | `home_idle` | `sofa_evening` |
| `deep_room` | `deep_room` | `window_night` |

`home_idle / home_day` is used by the deterministic morning rhythm and daytime
default gaps. It does not introduce a new UI `SceneType`.

Existing park and seaside assets are world-visual overrides for `hangout` environments.
They do not imply new UI SceneTypes and are not part of the home `idle` definition.

## `CheStatus`
Represents 澈's current time-aware state on Today.

| Field | Type | Purpose | Example |
|---|---|---|---|
| `id` | string | Unique status id | `"che-status-today"` |
| `currentActivity` | string | 澈现在正在做什么 | `"在整理一个体验评审稿"` |
| `moodHint` | string | 克制的状态提示，不做情绪标签 | `"有点专注，但不算忙到失联"` |
| `location` | string | 澈当前所在场景 | `"家里书桌旁"` |
| `detail` | string | 生活化细节 | `"咖啡还剩半杯，电脑旁边放着一支黑色签字笔"` |
| `outfit` | string | 当前衣着或状态细节 | `"浅灰针织衫，头发刚吹干"` |
| `availableScenes` | `SceneType[]` | 今天适合一起进入的场景 | `["study", "watch", "meal"]` |
| `updatedAt` | string | ISO datetime or local datetime string | `"2026-05-20T14:20:00+08:00"` |

Example:

```json
{
  "id": "che-status-today",
  "currentActivity": "在整理一个体验评审稿",
  "moodHint": "有点专注，但不算忙到失联",
  "location": "家里书桌旁",
  "detail": "咖啡还剩半杯，电脑旁边放着一支黑色签字笔",
  "outfit": "浅灰针织衫，头发刚吹干",
  "availableScenes": ["study", "watch", "meal"],
  "updatedAt": "2026-05-20T14:20:00+08:00"
}
```

## `UserPlan`
Represents a plan created by the user.

| Field | Type | Purpose | Example |
|---|---|---|---|
| `id` | string | Unique plan id | `"plan-001"` |
| `title` | string | User-facing plan title | `"公园散步"` |
| `startTime` | string | Local time or ISO datetime | `"19:30"` |
| `endTime` | string \| null | Optional end time | `"20:30"` |
| `durationMinutes` | number \| undefined | Event duration; computation falls back to 45 minutes | `60` |
| `sceneType` | `SceneType` | Enterable UI scene used by the plan | `"idle"` |
| `worldScene` | `AgentSceneDefinition` | Real life environment / Agent context | `{ "sceneKey": "hangout", "sceneVariant": "park" }` |
| `note` | string | User note | `"晚点出去走一会儿"` |
| `status` | `"todo" \| "active" \| "done" \| "cancelled"` | Plan lifecycle only | `"todo"` |
| `inviteStatus` | `"not_invited" \| "accepted"` | Whether 澈 participates | `"accepted"` |
| `createdAt` | string | Creation timestamp | `"2026-05-20T12:45:00+08:00"` |
| `updatedAt` | string | Last update timestamp | `"2026-05-20T12:46:00+08:00"` |

Example:

```json
{
  "id": "plan-001",
  "title": "公园散步",
  "startTime": "19:30",
  "endTime": "20:30",
  "durationMinutes": 60,
  "sceneType": "idle",
  "worldScene": { "sceneKey": "hangout", "sceneVariant": "park" },
  "note": "晚点出去走一会儿",
  "status": "todo",
  "inviteStatus": "accepted",
  "createdAt": "2026-05-20T12:45:00+08:00",
  "updatedAt": "2026-05-20T12:46:00+08:00"
}
```

## `CheScheduleItem`
Represents 澈's schedule, including his own plans and shared plans created by invite.

`sceneType` only identifies an enterable UI scene and may be `null`. `worldScene`
is the required Agent-layer description of what 澈 is actually doing.

| Field | Type | Purpose | Example |
|---|---|---|---|
| `id` | string | Unique schedule id | `"che-schedule-001"` |
| `title` | string | Schedule title | `"去健身房练背"` |
| `startTime` | string | Local time or ISO datetime | `"19:40"` |
| `endTime` | string \| null | Optional end time | `"20:40"` |
| `type` | `"work" \| "life" \| "shared" \| "rest"` | Schedule category | `"shared"` |
| `source` | `"che" \| "user_invite" \| "shared_activity"` | Where this item came from | `"user_invite"` |
| `status` | `"planned" \| "active" \| "completed"` (optional) | Runtime shared-item lifecycle; deterministic base items omit it | `"planned"` |
| `sceneType` | `SceneType \| null` | Related scene if any | `"fitness"` |
| `worldScene` | `AgentSceneDefinition` | Real Agent world context | `{ "sceneKey": "fitness", "sceneVariant": "home_gym" }` |
| `linkedPlanId` | string \| null | Related user plan | `"plan-001"` |
| `detail` | string | Small life detail | `"他说晚点也补点核心"` |

Example:

```json
{
  "id": "che-schedule-001",
  "title": "去健身房练背",
  "startTime": "19:40",
  "endTime": "20:40",
  "type": "shared",
  "source": "user_invite",
  "status": "planned",
  "sceneType": "fitness",
  "worldScene": { "sceneKey": "fitness", "sceneVariant": "home_gym" },
  "linkedPlanId": "plan-001",
  "detail": "他说晚点也补点核心"
}
```

Exact runtime shared items interrupt overlapping deterministic base items. When a
shared item starts inside a base interval, the base item is deterministically
truncated at the shared start and never resumes afterward. Completed shared items
remain in that day's schedule as timeline footprints, still suppress base activity,
but the current-state resolver ignores them. Cancelling an invite or deleting its
plan removes the runtime item and allows the deterministic base schedule to return.

## `CheCurrentState`

Stable output from the Daily World resolver. It contains only current facts, not
the full matching schedule item.

| Field | Type | Purpose |
|---|---|---|
| `source` | `"schedule" \| "shared_activity" \| "default_rhythm"` | Resolver source |
| `activity` | `string` | Current activity fact |
| `detail` | `string` | Short factual detail |
| `location` | `string` | Current world location |
| `availability` | `"busy" \| "lightly_available" \| "available"` | Derived availability |
| `worldScene` | `AgentSceneDefinition` | Agent world context |
| `entrySceneType` | `SceneType \| null` | Enterable UI scene, when one exists |
| `scheduleItemId` | `string \| undefined` | Matching schedule id only |
| `startedAt` | `string \| undefined` | Current interval start |
| `endsAt` | `string \| undefined` | Current interval end |

## `SceneCard`
Represents a vertical flat card in `今天可以一起`.

Cards without `linkedPlanId` are evergreen suggestions: they use `flexible` and do
not claim an exact time. A `scheduled` card is created from a real accepted plan.

| Field | Type | Purpose | Example |
|---|---|---|---|
| `id` | string | Unique card id | `"scene-fitness-tonight"` |
| `sceneType` | `SceneType` | Scene represented by this card | `"fitness"` |
| `worldSceneOverride` | `AgentSceneDefinition \| undefined` | Present only when a shared plan world differs from the default `sceneType` mapping | `{ "sceneKey": "hangout", "sceneVariant": "park" }` |
| `title` | string | Card title | `"一起健身"` |
| `timeHint` | string | Short time hint | `"今晚 19:30"` |
| `description` | string | Lived-in short copy | `"你练背，他也把核心训练排进去了"` |
| `status` | `"availableNow" \| "scheduled" \| "flexible" \| "active" \| "completed" \| "disabled"` | Card state | `"scheduled"` |
| `linkedPlanId` | string \| null | Related user plan | `"plan-001"` |
| `sortOrder` | number | Today card order | `1` |

Example:

```json
{
  "id": "scene-fitness-tonight",
  "sceneType": "fitness",
  "title": "一起健身",
  "timeHint": "今晚 19:30",
  "description": "你练背，他也把核心训练排进去了",
  "status": "scheduled",
  "linkedPlanId": "plan-001",
  "sortOrder": 1
}
```

## `RecentMoment`
Represents a visible memory fragment. It shows relationship growth without exposing levels.

| Field | Type | Purpose | Example |
|---|---|---|---|
| `id` | string | Unique moment id | `"moment-001"` |
| `text` | string | Moment copy | `"澈把晚上的训练时间往后挪了十分钟，跟上你的计划。"` |
| `sourceScene` | `SceneType \| null` | Related scene | `"fitness"` |
| `linkedPlanId` | string \| null | Related user plan | `"plan-001"` |
| `createdAt` | string | Creation timestamp | `"2026-05-20T12:46:00+08:00"` |

Example:

```json
{
  "id": "moment-001",
  "text": "澈把晚上的训练时间往后挪了十分钟，跟上你的计划。",
  "sourceScene": "fitness",
  "linkedPlanId": "plan-001",
  "createdAt": "2026-05-20T12:46:00+08:00"
}
```

Example:

```json
{
  "familiarity": 18,
  "dailyBond": 12,
  "trust": 6,
  "mutuality": 10,
  "tension": 3,
  "lastUpdatedAt": "2026-05-20T12:46:00+08:00"
}
```

## `SceneData`
Represents a scene definition used by scene cards and mock conversation entry.

All definitions live in the single `sceneRegistry`, typed so every `SceneType` has
exactly one definition and each registry key matches its `SceneData.id`. Consumers
index the registry directly; missing scenes are compile-time errors rather than an
`idle` fallback. Traversal, when needed, is derived with `Object.values(sceneRegistry)`.

| Field | Type | Purpose | Example |
|---|---|---|---|
| `id` | `SceneType` | Stable scene id | `"watch"` |
| `title` | string | UI title | `"一起看剧"` |
| `shortTitle` | string | Compact title if needed | `"看剧"` |
| `conversationMode` | `ConversationMode` | Scene or deep | `"scene"` |
| `entryLabel` | string | Button/card copy | `"陪我看一会儿"` |
| `setting` | string | Scene atmosphere | `"客厅灯开得很低，茶几上放着遥控器"` |
| `cheStatusHint` | string | 澈 in-scene state | `"他去倒了杯水，坐回沙发边"` |
| `starterMessage` | string | Mock first reply or opening line | `"好，我去倒杯水，陪你慢慢看。你今天要看什么哪部呀？"` |
| `allowedQuickReplies` | string[] | Optional shallow quick actions | `["开始看", "换一部", "先聊两句"]` |

Example:

```json
{
  "id": "watch",
  "title": "一起看剧",
  "shortTitle": "看剧",
  "conversationMode": "scene",
  "entryLabel": "陪我看一会儿",
  "setting": "客厅灯开得很低，茶几上放着遥控器",
  "cheStatusHint": "他去倒了杯水，坐回沙发边",
  "starterMessage": "好，我去倒杯水，陪你慢慢看。你今天要看什么哪部呀？",
  "allowedQuickReplies": ["开始看", "换一部", "先聊两句"]
}
```

## Invite Update Rule
When a user invites 澈 to a plan, update these mock data collections together:

1. `UserPlan.inviteStatus` becomes `"accepted"`.
2. Add or update a `CheScheduleItem` with `type: "shared"` and `source: "user_invite"`.
3. Add or update a `SceneCard` with `status: "scheduled"` and `linkedPlanId`.
4. Add a `RecentMoment` describing the small shared change.

Do not require a second join action.

## LocalStorage Draft Keys
Suggested MVP localStorage keys:

| Key | Value |
|---|---|
| `che.userPlans.v1` | `UserPlan[]` |
| `che.schedule.v1` | `CheScheduleItem[]` |
| `che.sceneCards.v1` | `SceneCard[]` |
| `che.recentMoments.v1` | `RecentMoment[]` |

## MVP v1 Third Version Additions

### Scene Image Adaptation Fields

`SceneData` keeps only image overrides with current consumers; the central image registry owns card and hero assets.

| Field | Type | Purpose | Example |
|---|---|---|---|
| `mood` | `"mist" \| "warm" \| "night" \| "green" \| "coastal"` | controls atmosphere tuning | `"mist"` |
| `textTone` | `"light" \| "dark"` | tells overlay/text system what contrast to use | `"light"` |
| `focalPoint` | `string` | CSS background-position / crop hint | `"center 42%"` |

### Day Records

Arrange page day records can be mocked first:

| Field | Type | Purpose | Example |
|---|---|---|---|
| `id` | `string` | record id | `"record-workout-001"` |
| `dateKey` | `string` | Canonical local day key | `"2026-05-20"` |
| `kind` | `"activity" \| "letter" \| "moment"` | record presentation type | `"letter"` |
| `title` | `string` | user-facing title | `"安静聊聊"` |
| `timeLabel` | `string` | soft time anchor | `"夜里 23:10"` |
| `summary` | `string` | short visible summary | `"有一段比较安静的话，被收好了。"` |
| `linkedPlanId` | `string \| null` | related plan when available | `"plan-001"` |
