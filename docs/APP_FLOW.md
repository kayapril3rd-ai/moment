# App Flow: 澈 MVP v1

## Main Tabs

```text
底部导航
  ├─ 今天
  ├─ 安排
  └─ 我的
```

There is no chat tab. Chat is entered from a scene.

## Today Flow

```text
今天
  ├─ Hero 去找他 / 回到场景 → Scene Chat
  ├─ 安静聊聊 → Deep Talk
  ├─ 今日相伴 → read-only stat
  ├─ 安静聊聊 grid card → Deep Talk
  ├─ 我的计划 → 我的今天 read-only drawer
  ├─ 澈的状态 → 澈的今天 read-only drawer
  ├─ 今天可以一起
  │   ├─ availableNow → Scene Chat
  │   ├─ scheduled → Activity Detail
  │   ├─ flexible → Activity Setup
  │   ├─ active → Scene Chat
  │   └─ completed → Activity Detail / day record
  └─ 最近的小片段 / 更多 → records
```

## Arrange Flow

```text
安排
  ├─ date strip
  ├─ 我的
  │   ├─ 添加计划
  │   ├─ plan card → Plan Detail
  │   └─ 邀请澈 → accepted → update sceneCards / cheSchedule / recentMoments
  ├─ 澈的
  │   └─ read-only che schedule
  └─ 当天记录
      ├─ 活动记录 → expand summary
      └─ 聊天信件 → expand quiet summary
```

## Mine Flow

```text
我的
  ├─ 澈的角色设定简介
  ├─ 我的偏好
  ├─ 记忆管理
  └─ 隐私与删除记录
```

MVP uses placeholders for non-core settings.

## Activity Setup

For flexible activities.

```text
Activity Setup
  ├─ 现在开始 → status active → Hero switches to active activity → Scene Chat available
  ├─ 定个时间 → inline time editor → status scheduled → Activity Detail
  └─ 稍后再说 → close
```

## Activity Detail

For scheduled, active, completed, and cancelled activities.

```text
scheduled
  ├─ 提前开始 → active
  ├─ 修改安排 → 安排 tab
  └─ 取消活动 → disabled

active
  ├─ 回到场景 → Scene Chat
  ├─ 标记完成 → completed + recent moment
  └─ 修改安排 → 安排 tab

completed
  ├─ 查看时光记录
  └─ 关闭
```

## Scene Chat

```text
Scene Chat
  ├─ 返回 → 今天
  ├─ 输入消息 → append user message → append mock 澈 reply
  └─ 安静聊聊 → Deep Talk
```

Rules:

- shallow daily companionship
- no automatic Deep Talk
- no mode labels
- no avatar frame
- duration comes from `activeStartedAt` when the activity is active

## Deep Talk

```text
安静聊聊
  ├─ 返回 → 今天
  └─ 输入消息 → slower mock reply
```

Rules:

- entered only by explicit user action
- night window / bay-window scene
- not therapy
- no diagnosis or interrogation

## State Update Rules

Adding a plan updates:

- Arrange / 我的
- Today / 我的计划 summary

Inviting 澈 updates:

- userPlan inviteStatus = accepted
- sceneCards
- cheSchedule
- recentMoments

Starting an activity updates:

- sceneCard status = active
- activeActivity / activeStartedAt
- Hero becomes active activity
- Scene Chat duration uses activeStartedAt

Completing an activity updates:

- sceneCard status = completed
- userPlan status = done
- activeActivity cleared if relevant
- Hero returns to default Che status
- recentMoments / dayRecords get a new record
