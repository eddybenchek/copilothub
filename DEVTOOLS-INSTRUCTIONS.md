Before building the next dev tools, create or identify a reusable internal playground layout component for CopilotHub native tools.

Goal:
Standardize the UI pattern used across:
- Power Fx Playground
- JSON to TypeScript
- Regex Tester
- CSS to Tailwind
- JS to TypeScript
- SQL to Prisma

Desired reusable pattern:
- Tool title/description
- Left panel: input/editor/actions
- Right panel: result/output/help
- Example buttons
- Primary action button
- Copy result button
- Error state
- Empty state
- Mobile responsive

Please inspect the current implementation and refactor only if it reduces duplication safely.
Keep styling consistent with existing CopilotHub UI.
After refactor, summarize what component(s) should be reused by future tools.