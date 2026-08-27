# UI Guide: 澈 MVP v1 Third Version

## Direction

Adopt the third visual direction:

- clear and quiet
- spacious
- low saturation
- mist blue-gray
- cream white
- deep pine green
- light glassmorphism
- full-screen scene imagery
- immersive chat layers
- warm but not sweet
- quiet but not gloomy

Avoid yellow-heavy warmth, dark tech UI, dashboard density, ordinary web layout, excessive cuteness, and therapy-app framing.

Core principle: scene images carry emotion; the UI system keeps everything unified.

## Color Tokens

Use these canonical tokens in `src/styles/global.css`:

```css
--bg-app: #EEF3EF;
--bg-soft: #F7FAF7;
--bg-warm: #F8F5EE;
--surface: rgba(255, 255, 250, 0.72);
--surface-strong: rgba(255, 255, 250, 0.9);
--surface-mist: rgba(233, 241, 237, 0.76);
--surface-glass: rgba(245, 249, 247, 0.58);
--text-main: #1F302C;
--text-soft: #60736D;
--text-faint: #8B9994;
--text-inverse: #F8FAF7;
--green-main: #41695B;
--green-dark: #2F5147;
--green-soft: #DCE8E2;
--blue-mist: #D8E4EA;
--blue-gray: #8FA7B6;
--slate: #394B54;
--warm-light: #EFCB78;
--wood-soft: #C9A57A;
--line-soft: rgba(47, 81, 71, 0.12);
--shadow-soft: rgba(31, 48, 44, 0.12);
```

## Typography

Use system sans:

```css
-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC",
"Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
```

Recommended sizes:

- Hero title: 28-32px, 700-760
- Page title: 24-28px, 700
- Module title: 21-23px, 700
- Card title: 17-18px, 650-700
- Body: 15-16px, 400-500
- Supporting text: 12-14px, 400-500
- Buttons: 15-16px, 700

Body copy should not be too heavy.

## Bottom Navigation

Replace the old floating schedule capsule with a bottom navigation containing only:

1. 今天
2. 安排
3. 我的

No dedicated chat tab. Conversation starts from scenes.

Style:

- translucent cream / mist surface
- subtle blur
- restrained line icons
- active tab in deep pine green
- inactive tabs in blue-gray
- safe-area aware
- does not cover content

## Today Page

Order:

1. Hero large scene card
2. 安静聊聊 function card
3. 你和澈今天 2x2 grid
4. 今天可以一起
5. 最近的小片段

The 2x2 grid contains:

- 今日相伴: effective companionship time only
- 安静聊聊: deep talk summary
- 我的计划: user day summary, read-only list on tap
- 澈的状态: Che day summary, read-only list on tap

## Scene Chat

Scene Chat uses a full-screen scene image:

- image fills the screen
- top: back, scene name, companionship duration
- bottom 45%: translucent glass chat layer
- input fixed at the bottom
- no avatar frame
- ordinary scenes can show a light 安静聊聊 entry but must not auto-enter deep talk

Chat layer:

- mist / cream translucent surface
- `backdrop-filter: blur(16px-22px)`
- opacity around 0.48-0.62
- top radius around 30px
- safe-area aware

## Deep Talk

Display name: 安静聊聊.

Scene:

- night
- window / bay window
- two people talking quietly
- distant city light
- low saturation, safe, quiet

Layout:

- full-screen night scene
- top: back, 安静聊聊, duration
- bottom 55%-62%: immersive translucent chat layer
- input placeholder: 慢慢说也可以

Deep Talk can use psychology silently, but foreground language must not feel like counseling.

## Scene Image Adaptation

Reserve these fields in scene data:

- `sceneType`
- `mood`
- `textTone`
- `focalPoint`

All future images, whether study room, park, seaside, or night window, must use the same UI container and token system.
