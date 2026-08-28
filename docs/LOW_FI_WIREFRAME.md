# Low-Fi Wireframe: 澈 MVP v1 Third Version

## Mobile Shell

Target:

- mobile-first
- max-width around 430px
- `100dvh`
- independent scroll area
- bottom navigation fixed inside the app shell
- content padding reserves the nav height and safe area

## Today

```text
┌──────────────────────────────┐
│ Hero large scene image        │
│ 下午 · 窗边                   │
│ 在整理一个体验评审稿          │
│ 咖啡还剩半杯...     去找他 →  │
├──────────────────────────────┤
│ 安静聊聊                     │
│ 如果今天有点满...      进入 > │
├──────────────────────────────┤
│ 你和澈今天                   │
│ ┌ 今日相伴 ┐ ┌ 安静聊聊 ┐    │
│ └ 我的计划 ┘ └ 澈的状态 ┘    │
├──────────────────────────────┤
│ 今天可以一起                 │
│ [thumb] 一起吃饭      18:40  │
│ [thumb] 一起健身      20:10  │
│ [thumb] 一起看剧      睡前   │
├──────────────────────────────┤
│ 最近的小片段          更多 >  │
│ 刚刚 · 你们约好了稍后...     │
├──────────────────────────────┤
│ 今天        安排        我的  │
└──────────────────────────────┘
```

## Arrange

```text
┌──────────────────────────────┐
│ 安排                         │
│ [今天] [明天] [周三] [周四]  │
│ ┌ 我的 ┐ ┌ 澈的 ┐            │
│                              │
│ [20:00 学习英语       添加]  │
│ 18:40 晚上吃点热的  已约好   │
│ 20:10 晚点练背      邀请澈   │
│                              │
│ 当天记录                     │
│ 活动记录 · 一起健身          │
│ 聊天信件 · 安静聊聊          │
├──────────────────────────────┤
│ 今天        安排        我的  │
└──────────────────────────────┘
```

`我的` can manage plans. `澈的` remains read-only.

## Mine

```text
┌──────────────────────────────┐
│ 我的                         │
│ 澈                           │
│ 28 岁，自由职业体验设计师    │
│                              │
│ 聊天偏好                 >   │
│ 澈记得的事               >   │
│ 隐私与删除记录           >   │
├──────────────────────────────┤
│ 今天        安排        我的  │
└──────────────────────────────┘
```

## Scene Chat

```text
┌──────────────────────────────┐
│ full scene image              │
│ ← 一起看剧 · 已陪你 32 分钟  │
│                              │
│                              │
│                              │
├──────── translucent glass ────┤
│ 客厅灯开得很低...             │
│ 澈: 今晚就轻一点吧。          │
│ 我: ...                       │
│ [和他说点什么...] [发送]      │
└──────────────────────────────┘
```

## Deep Talk

```text
┌──────────────────────────────┐
│ night window scene            │
│ ← 安静聊聊 · 刚开始           │
│                              │
├──── taller translucent layer ─┤
│ 你不用一下子讲清楚...         │
│ [慢慢说也可以] [发送]         │
└──────────────────────────────┘
```

## Activity Modals

Activity Setup:

- title
- short Che response
- buttons: 现在开始 / 定个时间 / 稍后再说
- 定个时间 opens inline time editor

Activity Detail:

- status
- title
- time
- location
- Che state
- status-specific actions

## Figma Notes

Recommended frames:

- Today third version
- Arrange / 我的 tab
- Arrange / 澈的 tab
- Mine placeholder
- Scene Chat immersive
- Deep Talk immersive
- Activity Detail
- Activity Setup
