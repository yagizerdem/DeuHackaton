---
name: Botanical Diagnostic System
colors:
  surface: "#faf9f3"
  surface-dim: "#dbdad4"
  surface-bright: "#faf9f3"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f5f4ee"
  surface-container: "#efeee8"
  surface-container-high: "#e9e8e2"
  surface-container-highest: "#e3e3dd"
  on-surface: "#1b1c19"
  on-surface-variant: "#424844"
  inverse-surface: "#30312d"
  inverse-on-surface: "#f2f1eb"
  outline: "#727974"
  outline-variant: "#c1c8c2"
  surface-tint: "#456555"
  primary: "#06271a"
  on-primary: "#ffffff"
  primary-container: "#1e3d2f"
  on-primary-container: "#86a895"
  inverse-primary: "#accebb"
  secondary: "#436653"
  on-secondary: "#ffffff"
  secondary-container: "#c2e9d1"
  on-secondary-container: "#486a57"
  tertiary: "#361b00"
  on-tertiary: "#ffffff"
  tertiary-container: "#552d00"
  on-tertiary-container: "#dd8e42"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#c7ebd6"
  primary-fixed-dim: "#accebb"
  on-primary-fixed: "#012114"
  on-primary-fixed-variant: "#2e4d3e"
  secondary-fixed: "#c5ebd3"
  secondary-fixed-dim: "#aacfb8"
  on-secondary-fixed: "#002113"
  on-secondary-fixed-variant: "#2c4e3c"
  tertiary-fixed: "#ffdcc1"
  tertiary-fixed-dim: "#ffb778"
  on-tertiary-fixed: "#2e1500"
  on-tertiary-fixed-variant: "#6c3a00"
  background: "#faf9f3"
  on-background: "#1b1c19"
  surface-variant: "#e3e3dd"
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: "500"
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: "500"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: "500"
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 26px
    fontWeight: "500"
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: "400"
    lineHeight: 36px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: "600"
    lineHeight: 30px
  title-lg:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 24px
  body-lg:
    fontFamily: Manrope
    fontSize: 17px
    fontWeight: "400"
    lineHeight: 26px
  body-md:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: "400"
    lineHeight: 22px
  body-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 18px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: "400"
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses the poise of an authoritative field botanist paired with the computational clarity of a contemporary retrieval-augmented research platform. It balances tactile field utility with scientific prestige.

### Brand Personality & Emotional Tenor

- **Empirical & Exact:** Every diagnosis, vector match, and citation is communicated with structural clarity, zero decorative clutter, and absolute typographic precision.
- **Organic & Grounded:** Rooted in quiet forest tones and mineral substrates, avoiding the synthetic neon greens typical of generic AI interfaces.
- **Protective & Reassuring:** Evokes calm mastery in high-stakes agricultural and arboricultural scenarios such as invasive pest detection or fungal outbreaks.

### Aesthetic Paradigm

The interface employs **Scientific Editorial Modernism**:

- Deep evergreen anchors the hierarchy, while mineral sands provide generous, resting background planes.
- Micro-textures take the form of delicate, calibrated 1px structural hairpins and tonal overlays rather than noisy skeuomorphism.
- Citations, scientific taxonomies, and retrieved vector references are elevated via warm amber and emerald accents reminiscent of botanical laboratory notes.

## Colors

The palette is derived from specimen archives, forest canopies, and mineral grounding. Contrast ratios strictly exceed WCAG AAA standards for critical scientific data.

### Palette Roles

- **Primary (`#1E3D2F` - Deep Canopy):** The bedrock tone. Applied to prominent semantic actions, navigation frames, primary headlines, and crucial diagnostic indicators.
- **Secondary (`#5A7D69` - Sage Pine):** Supports secondary metrics, inactive tab borders, leaf-health indicators, and secondary contextual buttons.
- **Tertiary (`#C87D32` - Warm Amber / Gall Resin):** Reserved exclusively for dynamic citations, RAG provenance badges, warning states for invasive vectors, and high-urgency alerts.
- **Neutral (`#F4F3ED` - Sandstone Linen):** The base atmospheric canvas. Eliminates harsh digital glare during prolonged daylight fieldwork while providing warm organic separation.
- **Auxiliary Emerald (`#2A8C55` - Foliar Green):** Utilized for positive identification matches, verified species status, and healthy tissue markers.
- **Surface Elevation Layers:**
  - `surface-base`: `#F4F3ED`
  - `surface-raised`: `#FCFCF9`
  - `surface-overlay`: `#EAE7DC`
  - `surface-inverse`: `#13261E`

## Typography

The type system pairs the editorial elegance of classical herbarium catalogs with the legibility and operational precision needed for AI diagnostics.

### Role Allocation

- **Display & Section Headers (`Newsreader`):** Italicized Latin binomials (_e.g., Anoplophora chinensis_) and clinical diagnosis titles command gravitas and authority without feeling sterile.
- **Core Interface & Reading Flow (`Manrope`):** Delivers clean geometry, open counters, and high distinction between numerals and characters for observational field notes, user prompts, and streaming RAG responses.
- **Taxonomic & Data Metadata (`JetBrains Mono`):** Applied to vector similarity confidence metrics, EPPO registry codes, geo-coordinates, and citation index numbers.

### Typographic Discipline

- Scientific species names rendered in `Newsreader` must default to italic styling within diagnoses and report headers.
- Never use full capitalization on `Newsreader` headings; reserve uppercase transformations solely for `JetBrains Mono` metadata badges.

## Layout & Spacing

The layout philosophy relies on a balanced fluid grid framed by generous white and sand-tinted margins. It replicates the expansive margins of classical botanical broadsheets.

### Grid & Composition

- **Desktop (>=1200px):** 12-column layout with 24px (`1.5rem`) gutters and 48px (`3rem`) outer canvas borders. Diagnostic split-screens feature a 5-column conversational context pane paired with a 7-column analytical dossier panel.
- **Tablet (768px - 1199px):** 8-column layout with 20px gutters and 32px canvas margins. Sidebars compress into overlay sheets.
- **Mobile (<768px):** 4-column layout with 16px (`1rem`) gutters and 20px (`1.25rem`) edge buffers.

### Spatial Rhythm

- Compact spatial tokens (`space-xs`, `space-sm`) govern dense reference zones: citation anchor tags, confidence bars, and EPPO taxonomy tags.
- Structural tokens (`space-lg`, `space-xl`) isolate streaming answers from the prompt interface, preventing cognitive fatigue in high-stress field assessments.

## Elevation & Depth

Visual hierarchy is maintained through disciplined tonal layering and crisp, low-contrast ghost outlines, avoiding heavy drop shadows.

### Atmospheric Layering

- **Plane 0 (Canvas Base):** Sandstone linen (`#F4F3ED`) acts as the natural backdrop.
- **Plane 1 (Cards & Data Panels):** `#FCFCF9` framed with a subtle 1px border of `rgba(30, 61, 47, 0.08)`.
- **Plane 2 (Floating Inspect Panels & RAG Modals):** `#FCFCF9` accompanied by an ambient, botanical-tinted shadow: `0 12px 32px -4px rgba(30, 61, 47, 0.06), 0 4px 12px -2px rgba(30, 61, 47, 0.03)`.
- **Plane 3 (Invasive Alert Banners):** Subtly tinted amber or emerald container beds with crisp borders (`rgba(200, 125, 50, 0.25)`).

### Elevation Restraint

Elevation should never mimic heavy physical plastic. Shadows must remain chromatic, using diluted forest green undertones instead of neutral black.

## Shapes

The interface embraces a refined curvature that evokes organic morphology without losing scientific discipline.

### Geometry Specifications

- **Cards, Diagnostic Dossiers, & Image Containers:** Rendered with `rounded-lg` (16px / `1rem`), conveying an organic, handheld specimen-card feeling.
- **Interactive Controls (Inputs, Buttons):** `rounded-md` (8px / `0.5rem`) to retain structural, tool-like precision.
- **Pills, Badges & Citation Tags:** Completely rounded radii to set them apart as distinct metadata units.
- **Image Masks:** Botanical specimen micrographs and pest photography are framed with rounded corners and bounded by a 1px border.

## Components

### Buttons

- **Primary Action (Diagnosis / Search):** Solid Deep Canopy (`#1E3D2F`) background, `#FCFCF9` text, `rounded-md`. Subtle hover transition to `#29523F`.
- **Secondary Action (Export / Filter):** Transparent fill, 1px border in Sage Pine (`#5A7D69`), text in `#1E3D2F`.
- **Amber Action (Quarantine Protocol / Critical Alert):** Solid Warm Amber (`#C87D32`), white text.

### Chips & Badges

- **Citation Badges:** Pill-shaped, rendered with Warm Amber stroke (`#C87D32` at 30%), pale amber background (`#F9F3EA`), containing `label-sm` monospaced reference tokens (e.g., `[EPPO-A2: #104]`). Clicking triggers the grounding source sheet.
- **Taxonomic Status Chips:** Soft Sage (`#5A7D69` at 15%) background with deep green font; displays verification markers (e.g., `Confirmed Vector`).

### Input Fields & Multimodal Prompt Box

- **Field Canvas:** `#FCFCF9` surface with a 1px border of `rgba(30, 61, 47, 0.16)`.
- **Focus State:** Border shifts cleanly to `#1E3D2F` accompanied by a 2px outer ring of `rgba(90, 125, 105, 0.25)`.
- **Multimodal Specimen Upload Area:** Dashed Sage Pine border (`1.5px`), Sandstone Linen inner wash, complete with quick action toggles for leaf, bark, and insect pathology cameras.

### Cards

- **Dossier & Diagnostic Cards:** Built upon `#FCFCF9` with fine 1px border framing, interior padding of `space-lg`, featuring an upper metadata row (`Newsreader` italicized species taxonomy alongside `JetBrains Mono` EPPO code).

### Invasive Vector Alert Callouts

- **Structure:** Left-accented 4px vertical bar in `#C87D32`, soft beige-amber container backdrop (`#FAF5EE`), presenting actionable quarantine procedures with prominent citations.

### RAG Provenance Drawer

- Dedicated sliding panel displaying retrieved scientific literature fragments, similarity scores (rendered in `JetBrains Mono`), and specimen library reference imagery.
