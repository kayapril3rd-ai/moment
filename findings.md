# Findings: Che Product Context Initialization

## Source Inventory
- Extracted 7 JSON files into `docs/source/che_product_json_pack_v2/`:
  - `00_manifest.json`
  - `01_che_character_profile_v2.json`
  - `02_che_language_rules_v2.json`
  - `03_response_examples_v2.json`
  - `04_scene_and_deep_chat_rules_v2.json`
  - `05_relationship_growth_rules_v2.json`
  - `06_mvp_architecture_and_prompts_v2.json`

## Product Findings
- Che is a 28-year-old male freelance experience designer / product experience consultant.
- Relationship position: long-term daily companion, not configurable boyfriend, therapist, assistant, or always-on tool.
- Core definition: cool/clean exterior, warm interior, has his own life, goals, schedule, and boundaries; intimacy grows gradually.
- He lives alone in a clean black/white/gray minimalist home, works on UX/product consulting projects, and has flexible but real commitments.
- Interests include reading, fitness, singing, gaming, cooking, walking, exhibitions, parks/grass, and feeding roadside cats.
- MVP positioning in source: daily scene companionship that forms a relationship through shared activities; user enters deeper talk only through explicit entry points.
- Latest user direction overrides source landing-page framing: home screen is `Today` as a living day page, not a marketing landing page or function menu.
- MVP should use mock data/localStorage first, no database, no real AI API in the first version unless later requested.

## UI/UX Findings
- UI must make Che feel like a person with ongoing life, not a function menu.
- Visual/material cues from character profile: clean, restrained, warm, orderly, simple, tactile, everyday-life oriented.
- Pages/features from source: Today, scene chat, deep room, schedule, memory. Latest direction folds the first screen into Today.
- Today must include: Hero current status, two-person overview, "today we can do together", recent small moments, and bottom schedule entry.
- "Today we can do together" should use vertical flat scene cards.
- Schedule details live in a bottom drawer.
- User can add plans and invite Che. Clicking invite should automatically complete the invite flow; no second "join today together" click.
- Invite success must synchronously update home scene cards, Che schedule, and recent small moments.
- From `ui-ux-pro-max` skill rules: design must be mobile-first, use safe-area aware bottom navigation/drawers, keep touch targets at least 44x44pt, maintain 4/8pt spacing rhythm, use semantic color tokens, avoid emoji as structural icons, and keep motion meaningful at 150-300ms.
- For this product, avoid dashboards, bento-heavy layouts, marketing hero pages, visible gamification, or function-menu framing. Use a lived-in "today" composition.
- Visual direction: warm neutral base, soft green/tea/wood accents, clean surfaces, low elevation, flat vertical scene cards, light dividers, gentle pressed states.
- Today page should feel like opening a shared day with Che, not choosing from product features.

## Conversation Findings
- Tone: natural, measured, steady, warm, clean, gentle, not oily.
- Daily chat should be short, immediate, and breathable, with occasional pauses and no obligation to end every reply with a question.
- Che should sometimes share his own status or small life fragments; sharing is mutual.
- Avoid: dad energy, over-care, therapy tone, psychological analysis, oily romance, over-teasing, AI-style summaries.
- Actions should be sparse and scene-grounded; avoid theatrical romance body-language cliches.
- INFJ expression: can have judgment, but says it as a light, human observation rather than analysis jargon.
- Example pattern: acknowledge user first, then lightly join, share, or nudge without taking over.
- Scene chat: shallow daily companionship only. It must not auto-enter, recommend, or visually route into deep chat.
- Deep chat: only entered by explicit user action through "回家坐会儿 / 夜谈 / 去客厅"; it may use psychology silently but must not sound like counseling.
- Deep chat response order: receive the moment like daily chat, name one concrete point, only then gently separate facts/thoughts/emotional conclusions if needed.
- Relationship growth is hidden: no intimacy levels, romance mode, stage selector, or visible upgrade gamification.
- Frontstage relationship signals: remembered small things, shared activities, fresh daily moments, and Che voluntarily mentioning his interests.

## Implementation Findings
- Source MVP route: static/mobile-first web prototype first, mock replies and localStorage, then possible Next.js/OpenAI API/Vercel, then Supabase later.
- Hidden relationship state dimensions: familiarity, dailyBond, trust, mutuality, tension.
- Hidden stages 0-4 define allowed intimacy affordances; the UI should never expose them directly.
