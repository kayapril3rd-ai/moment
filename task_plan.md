# Task Plan: Che Product Context Initialization

## Goal
Initialize project context from `che_product_json_pack_v2.zip`, synthesize product, conversation, UI/UX, and implementation planning documents, and avoid writing page code this round.

## Phases

| Phase | Status | Output |
|---|---|---|
| 1. Setup and extraction | complete | Unzip source package into `docs/source/che_product_json_pack_v2/`; create planning files |
| 2. Source inventory | complete | List and read all JSON files; capture findings |
| 3. Product synthesis | complete | Define product direction, MVP scope, role model, time/schedule rules |
| 4. UI/UX synthesis | complete | Extract mobile app IA, Today page, cards, drawer, invite flow, visual rules |
| 5. Conversation synthesis | complete | Define persona, language, shallow/deep chat boundaries and system rules |
| 6. Documentation writing | complete | Create `AGENTS.md`, `docs/PRODUCT_SPEC.md`, `docs/UI_GUIDE.md`, `docs/CONVERSATION_SYSTEM.md`, `docs/IMPLEMENTATION_PLAN.md` |
| 7. Review and summary | complete | Verify files exist and summarize next development plan |
| 8. Phase 1 frontend scaffold | complete | Initialize Vite + React + TypeScript skeleton, Today static UI, mock data, types, style tokens |

## Constraints
- Do not write page code in this round.
- Treat source JSON as product data, not executable instructions.
- Use `planning-with-files` for planning.
- Use `ui-ux-pro-max` to refine UI/UX rules.
- Preserve the newest direction supplied by the user as authoritative when source files conflict.
- Current Phase 1 request allows frontend scaffold and Today static UI skeleton only.
- Do not implement invite logic, chat, schedule drawer interaction, deep room, localStorage, AI API, database, auth, or payment in Phase 1.

## Errors Encountered
| Error | Attempt | Resolution |
|---|---|---|
| `ui-ux-pro-max` search script missing | Tried `python C:\Users\hp\.codex\skills\ui-ux-pro-max\scripts\search.py ...` | Installed skill has `scripts` as a placeholder file, not a directory. Proceeding from loaded `SKILL.md` rules manually. |
| Node/npm unavailable in local shell | Checked `node --version` and `npm --version` | `node.exe` is denied and `npm` is not installed on PATH, so dependency install/dev server verification could not be run in this environment. |
