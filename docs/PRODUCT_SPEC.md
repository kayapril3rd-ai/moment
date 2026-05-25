# Product Spec: 澈 MVP v1

## Positioning

This is a mobile-first AI companion / virtual boyfriend-style daily companionship product centered on 澈.

The product is not a task manager, chatbot menu, therapy app, productivity assistant, or visible relationship simulator. It should feel like opening a shared day: the user has their life, 澈 has his life, and the app creates believable small intersections.

## Character

澈 is 28, male, a freelance experience designer / product experience consultant.

He is clean, steady, observant, respectful, warm under a cool surface, and slowly intimate. He has his own schedule, fatigue, interests, work pressure, and boundaries.

He is not an assistant, therapist, configurable boyfriend, always-available tool, or customer-service emotional responder.

## Core Rules

- The user and 澈 share real-world time.
- 澈 has his own current state and schedule.
- Today is the first screen and a living day page.
- Deep Talk only starts from explicit user action.
- Scene Chat stays shallow and daily by default.
- No intimacy levels, affection scores, romance modes, or relationship stages.
- No automatic deep chat recommendation.
- No forced strict time blocks or auto-generated end times.

## Main Navigation

MVP v1 uses three bottom tabs:

1. 今天
2. 安排
3. 我的

There is no 对话 tab. Conversation starts from Hero, activity cards, or 安静聊聊.

## Today

Today order:

1. Hero large scene card
2. 安静聊聊 function card
3. 你和澈今天 2x2 grid
4. 今天可以一起
5. 最近的小片段

Hero always represents what is happening now:

- default: 澈's current state
- active activity: what user and 澈 are doing together

The 2x2 grid:

- 今日相伴: effective companionship time
- 安静聊聊: Deep Talk summary
- 我的计划: user plan summary, read-only details on tap
- 澈的状态: Che status summary, read-only details on tap

## Arrange

The 安排 tab is the management entrance.

Structure:

1. title: 安排
2. horizontal date strip
3. 我的 / 澈的 segmented control
4. plan list
5. day records

我的 tab can:

- add plan
- modify plan
- modify time
- invite 澈
- cancel invite
- mark complete
- delete plan

澈的 tab is read-only and used as reference for invitations.

Day records include:

- activity records, expandable
- Deep Talk / chat letters, shown as quiet summaries before full detail

## Mine

The 我的 tab is a lightweight MVP placeholder:

- 澈 role intro
- user preferences
- memory management entry
- privacy and delete-record explanation
- data clearing placeholder

No complex settings in this phase.

## Scene Chat

Scene Chat is shallow daily companionship.

Rules:

- full-screen scene image
- image should depict the activity
- top shows back, scene title, companionship duration
- bottom 45% is a translucent chat layer
- input fixed at bottom
- no avatar frame
- ordinary scenes can include a light 安静聊聊 entry
- ordinary scenes never auto-enter Deep Talk

## Deep Talk

Display name: 安静聊聊.

It is a user-initiated deeper space for slower emotional and cognitive整理, not therapy.

Rules:

- independent page
- night window / bay-window scene
- chat layer 55%-62%
- no diagnosis, lectures, questionnaires, or decisions for the user
- foreground language remains human and private

## State Consistency

Shared state:

- userPlans
- cheSchedule
- sceneCards
- recentMoments
- dayRecords
- activeActivity
- activeScene
- activeStartedAt
- companionshipStats

State updates must keep Today, Arrange, Scene Chat, Activity modals, and records consistent.

## Time Rules

Use two separate concepts:

- time anchor: `18:40`, `20:10`, `稍后`, `睡前`, `今天找个时间`
- status: `待做`, `已约好`, `进行中`, `已完成`, `已取消`

Compact lists show only short anchors. End times belong only in detail/edit contexts when truly known.

## Scene Image Fields

Reserve:

- `imageUrl`
- `mood`
- `textTone`
- `focalPoint`

These let future images adapt without changing the UI structure.
