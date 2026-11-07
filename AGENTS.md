## Google Stitch → React UI Workflow

Use this workflow whenever a task involves implementing, updating, or matching UI designs for the **Depark-Hackaton** project.

### 1. Fetch the design from Stitch (MCP)

- Connect to Google Stitch through its MCP server. If the Stitch MCP tools are unavailable, stop and ask the user to configure them — do not invent designs.
- Open the Stitch project named **Depark-Hackaton** and locate the screen(s) relevant to the task.
- Retrieve the screen's HTML/CSS (or code export), screenshot, and any design tokens (colors, typography, spacing, radii, shadows).
- Treat the Stitch output as the source of truth for layout, hierarchy, copy, and visual style.

### 2. Apply the `frontend-design` skill

- Load the `frontend-design` skill **before** writing any UI code and follow it strictly.
- Use it to refine the Stitch output into a distinctive, intentional design: consistent typography scale, deliberate color usage, spacing rhythm, and accessible contrast.
- Do not fall back to generic, templated layouts when the Stitch design specifies otherwise.

### 3. Implement in the web app

- Target: `apps/web` (React + TypeScript + Vite + Tailwind CSS + shadcn/ui).
- Pages go in `apps/web/src/pages/`; reusable components go in `apps/web/src/components/`.
- **Reuse existing shadcn/ui components** from `apps/web/src/components/ui/` before creating new ones. Add missing ones via the shadcn CLI (`npx shadcn@latest add <component>`), not by hand.
- Convert Stitch HTML/CSS into idiomatic React + Tailwind utility classes. Do not paste raw HTML or inline `<style>` blocks.
- Map Stitch design tokens to Tailwind theme variables in `apps/web/src/index.css` instead of hard-coding hex values in components.
- Use `cn()` from `apps/web/src/lib/utils.ts` for conditional class names.
- Ensure layouts are responsive (mobile first) and accessible (semantic HTML, labels, focus states, `alt` text).

### 4. Verify

- Run `npm run build` (or lint/type-check) in `apps/web` and fix all errors.
- Visually compare the rendered page against the Stitch screenshot and resolve noticeable differences in spacing, color, and typography.
