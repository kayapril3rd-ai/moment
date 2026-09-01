# Design QA — Home & Activity Icon Polish

- Source visual truth:
  - `C:\Users\hjqAp\AppData\Local\Temp\codex-clipboard-a8dd635a-b363-4671-b1e6-b21532f896b5.png` (1448 × 1086, final direct-replacement board)
  - `C:\Users\hjqAp\AppData\Local\Temp\codex-clipboard-84684c35-7f11-4cc6-8757-691f5e0e7e16.png` (1280 × 316)
  - `C:\Users\hjqAp\AppData\Local\Temp\codex-clipboard-ff46d0bd-704b-4367-b571-75530967bfc3.png` (256 × 320)
  - `C:\Users\hjqAp\AppData\Local\Temp\codex-clipboard-dd61b8a8-26a9-4db3-a44d-9afad871d638.png` (986 × 801)
- Implementation screenshots:
  - `E:\work\work\lumen\qa-direct-icons-today-375.png` (375 × 844 CSS px)
  - `E:\work\work\lumen\qa-direct-icons-arrange-375.png` (375px wide full-page capture)
  - `E:\work\work\lumen\qa-direct-icons-scene-chat-375.png` (375 × 844 CSS px)
- Combined comparison: `E:\work\work\lumen\qa-direct-icons-comparison.png`
- Responsive checks: 320, 375, and 430 CSS px
- State: Today default state and Arrange with locally created sleep, meal, and park-walk plans

## Evidence

The source is an icon approval board rather than a full-page mock. Full-page checks therefore verify that the existing Moment layout, typography, logo, cards, and navigation remain unchanged, while focused comparisons verify icon shape, scale, color, and line weight.

Primary interactions and layout checked in a real Edge browser:

- Today, Arrange, and Mine bottom navigation remains functional.
- Arrange plan input created `学习专注`, `公园散步`, `看海休息`, and `吃晚饭` without changing plan behavior.
- No horizontal overflow at 320, 375, or 430px.
- Quiet Chat container is 42px with a 30px glyph.
- Overview containers are 28px with 22px glyphs; at 320px they are 26px with 20px glyphs.
- Arrange activity containers remain 36px; direct-source glyph slots are 24px at 375px and above, and 22px at 320px.
- Scene Chat back, end, and launcher controls use the same translucent warm-white material; the launcher is 52px with a 24px glyph.
- Existing original app logo is unchanged.

## Findings and comparison history

- Earlier P2: the reconstructed cat and dog heads did not match the approved drawings.
  - Fix: replaced both with transparent, source-derived 256px assets, recolored only to the existing `--primary-dark` token value.
- Earlier P2: the main Quiet Chat icon still used a reconstructed cat bubble.
  - Fix: replaced it with a transparent source-derived asset from the approved board.
- Earlier P2: reconstructed SVG strokes remained visibly different from the approved raster reference even after normalization.
  - Fix: replaced the affected Home/Activity glyphs with transparent, source-derived assets from the approved boards. SVG masks retain `currentColor` state handling without redrawing the glyphs.
- Earlier P2: glyphs occupied too little of their green containers.
  - Fix: preserved container geometry while increasing Quiet Chat to 30px and overview glyphs to 22px (20px at 320px).
- Earlier P2: Arrange activity glyphs were forced down to 18px by the final compact-card rule.
  - Fix: added one activity-only glyph class, preserved the 36px container, trimmed inconsistent transparent padding, and set the glyph slot to 24px at 375px.
- Earlier P2: the first direct Meal/Fitness crops included their English labels and excessive empty space.
  - Fix: recropped both to glyph-only bounds, normalized all source-asset padding, and verified that no text remains inside an icon asset.
- Earlier P2: the Scene Chat launcher was a 68px opaque white ball with a heavier legacy glyph.
  - Fix: changed it to a 52px transparent glass control with a 1.7px speech-bubble glyph, matching the header control family.

Post-fix evidence is recorded in the combined comparison and the latest 375px screenshots. No actionable P0, P1, or P2 differences remain for the requested scope.

## Required fidelity surfaces

- Fonts and typography: unchanged.
- Spacing and layout rhythm: existing card, navigation, and icon-container dimensions preserved.
- Colors and tokens: icon surfaces use `--primary-soft`; strokes/source assets use the `--primary-dark` value.
- Image and icon quality: approved Home/Activity drawings are source-derived 256px transparent assets, displayed through SVG masks for crisp sizing and token-driven color.
- Direct replacement note: Home/Activity reference glyphs are source-derived transparent assets rendered through SVG alpha masks so active/inactive color continues to follow `currentColor`.
- Scene Chat exception: its internal launcher glyph remains the original `ChatSoftIcon` per user direction; only its surrounding button material changed.
- Copy and content: unchanged.

final result: passed

---

# Design QA — UX polish

- Source visual truth: `E:\codex\generated_images\01a04254-3bc9-74e1-bb1f-0ba2bd7b3a2a\exec-6c20ff42-7519-416b-8003-8ec525aa6684.png`, with the user's latest written overrides taking precedence: keep the existing letter drawer, use left-aligned text records instead of bubbles, use a deep-green unread dot, and reduce the long-press menu.
- Implementation screenshots:
  - `E:\work\work\lumen\qa-ux-polish-today-375.png`
  - `E:\work\work\lumen\qa-ux-polish-today-moments-375.png`
  - `E:\work\work\lumen\qa-ux-polish-letter-detail-375.png`
  - `E:\work\work\lumen\qa-ux-polish-letter-context-375.png`
  - `E:\work\work\lumen\qa-ux-polish-letter-delete-375.png`
- Combined comparison: `E:\work\work\lumen\qa-ux-polish-comparison.png`
- Viewport: 375 × 812 CSS px, device scale factor 1.
- Source pixels: 1536 × 1024. Implementation screenshots: 375 × 812 each. The combined board normalizes each source state and implementation screenshot into aligned columns; exact pixel comparison is not claimed because the user's written override intentionally changes three states from the earlier mock.
- State: Today unread, Today recent moments copy, letter detail drawer, long-press delete menu, and delete confirmation.

## Full-view comparison evidence

- The existing Moment shell, bottom navigation, Arrange date state, cards, warm ivory surfaces, and sage/forest palette remain unchanged.
- The letter detail stays in the existing overlay/sheet above the Arrange page. The background remains visible through the scrim and closing returns to the unchanged list state.
- The long-press menu is a fixed overlay near the pressed letter. Browser measurements before and after opening were identical for both letter-card y positions, and list `scrollTop` remained 72.
- The confirmation remains a compact centered modal rather than a bottom sheet.

## Focused region evidence

- Typography: transcript body is 15px with 1.7 line height; role labels are 12px. All entries are left aligned and use transparent backgrounds.
- Spacing/layout: transcript gap is 18px. The drawer content scrolls to its exact bottom (`scrollTop` 184 / max 184) without horizontal overflow.
- Colors/tokens: unread dot computes to `rgb(63, 94, 80)` (`var(--primary-dark)`) at 6 × 6px. Transcript and modal use existing semantic text/surface tokens.
- Image/icon quality: no image or icon assets changed in this polish.
- Copy/content: Today displays `最近的小片段`; `更多` remains. Transcript preserves all ten seeded messages in order.
- Context menu: visible menu is 50 × 30px with 13px text and only `删除`; its 56 × 44px positioning wrapper preserves a usable touch region without enlarging the visible label. Final measured menu bounds (x 197.9, y 472.7) stay fully inside the pressed card bounds (x 40, y 440.3, width 295, height 135.5).
- Confirmation: dialog measures 280 × 135px and contains only the requested title, helper copy, and two actions.

## Interaction verification

- Notification: unread before open; false after close; false after refresh; a newly added notification restored unread state.
- Letter short press: opened the existing drawer.
- Letter long press: opened the compact overlay menu without also opening detail.
- Outside/menu cancellation: no deletion occurred.
- Confirmation cancellation: both records remained.
- Confirmation deletion: one record was removed immediately, persisted to `moment.dayRecords`, and stayed removed after refresh.
- Console errors: none.
- Runtime page errors: none.

## Findings

- No actionable P0, P1, or P2 mismatches remain against the user's latest overrides.
- The differences from the earlier generated mock (red dot, alternating bubbles, larger context menu) are intentional and directly requested.

## Comparison history

- Initial implemented comparison: passed. No P0/P1/P2 visual fix loop was required after the browser-rendered comparison.

## Follow-up polish

- None required for this scoped change.

final result: passed
