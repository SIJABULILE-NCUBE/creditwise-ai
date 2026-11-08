---
name: Ledger Calm
colors:
  surface: '#f8f9ff'
  surface-dim: '#cfdbec'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e4efff'
  surface-container-high: '#dee9fb'
  surface-container-highest: '#d8e3f5'
  on-surface: '#111c29'
  on-surface-variant: '#3f4945'
  inverse-surface: '#26313f'
  inverse-on-surface: '#e9f1ff'
  outline: '#6f7975'
  outline-variant: '#bfc9c4'
  surface-tint: '#22695a'
  primary: '#004337'
  on-primary: '#ffffff'
  primary-container: '#0f5c4d'
  on-primary-container: '#8ed2bf'
  inverse-primary: '#8fd4c1'
  secondary: '#55606a'
  on-secondary: '#ffffff'
  secondary-container: '#d8e4f0'
  on-secondary-container: '#5b6670'
  tertiary: '#553300'
  on-tertiary: '#ffffff'
  tertiary-container: '#744800'
  on-tertiary-container: '#ffb759'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#abf0dc'
  primary-fixed-dim: '#8fd4c1'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#005143'
  secondary-fixed: '#d8e4f0'
  secondary-fixed-dim: '#bdc8d3'
  on-secondary-fixed: '#121d25'
  on-secondary-fixed-variant: '#3d4851'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#111c29'
  surface-variant: '#d8e3f5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  numeric-xl:
    fontFamily: IBM Plex Mono
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  numeric-lg:
    fontFamily: IBM Plex Mono
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  numeric-md:
    fontFamily: IBM Plex Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  numeric-sm:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.5rem
  space-sm: 1rem
  space-md: 1.5rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

The design system establishes a high-trust, composed atmosphere rooted in classic financial ledger traditions, tailored specifically for personal credit intelligence and advisory workflows in South Africa. The aesthetic rejects gamified, high-dopamine fintech conventions in favor of tactile clarity, stability, and enduring precision.

### Design Movement
- **Modern Ledger Minimal:** Built upon warm foundational paper planes, structural hair-line borders, high-legibility ink contrasts, and typographic rigor. 
- **Emotional Intent:** Instill confidence, restraint, and complete transparency. Financial metrics and credit insights present with deliberate archival gravity rather than ephemeral speculation.

## Colors

The palette simulates archival banking documents, warm parchment substrates, and crisp ink work.

### Palette Architecture
- **Canvas Base:** `#F7F5F0` (warm paper). Used across the core document canvas and page backgrounds.
- **Card & Sheet Surface:** `#FFFFFF` (card white). Delivers crisp focal reading surfaces against the paper substrate.
- **Primary Ink & Brand:** `#0F5C4D` (ledger green). Represents authoritative state, active brand emphasis, primary selections, and high-confidence metrics.
- **Neutral Ink (Text & Values):** `#1F2A37` (ink deep). The definitive body and headline text ink.
- **Secondary Slate:** `#5B6670` (slate). Used for metadata, structural labels, table headings, and muted guidance.
- **Structural Dividing Lines:** `#E3DED3` (ruled border). A warm hairline tone matching traditional bound ledger ruling.
- **Focus & Deliberate Attention:** `#B7791F` (brass accent). Strictly isolated to interactive keyboard focus rings, active accessibility boundaries, and deliberate inspection outlines.
- **Semantic Feedback:**
  - **Success:** `#1E7B4A` (ledger credit/surplus).
  - **Warning:** `#B45309` (attention/rebalance required).
  - **Error:** `#B42318` (debt risk/breach/default).

## Typography

Typography governs hierarchy through dual-engine classification: **Inter** handles narrative structure, instruction, and system UI, while **IBM Plex Mono** governs all numerical data, currency figures (ZAR / R), percentages, ratios, and dates.

### Font Implementation Rules
- All currency balances, credit scores, repayment periods, percentage utilization rates, and tabular outputs must strictly use the numeric font styles backed by `IBM Plex Mono`.
- Inter handles structural titles and body copy, utilizing medium/semibold weights to anchor headings cleanly without needing display serifs.
- Numbers rendered inside tables must default to tabular lining alignment via IBM Plex Mono to ensure absolute vertical scanability.

## Layout & Spacing

The spatial framework relies on a disciplined 8px baseline grid (`0.5rem` steps) enforcing linear balance across all screens.

### Grid & Breakpoints
- **Desktop (≥ 1024px):** 12-column responsive layout with `24px` (`1.5rem`) gutters and a max canvas constraint of `1280px`. Section margins are set to `32px` (`2rem`).
- **Tablet (768px - 1023px):** 8-column layout with `16px` (`1rem`) gutters and `24px` (`1.5rem`) margins.
- **Mobile (< 768px):** 4-column layout with `16px` (`1rem`) gutters and `16px` (`1rem`) outer margins.

### Spatial Rhythm
- Components strictly stack and space out using 8px multiples: 8px (`space-xs`), 16px (`space-sm`), 24px (`space-md`), 32px (`space-lg`), and 48px (`space-xl`).
- Micro-elements (such as internal input padding, button contents, and tabular cells) derive horizontal and vertical containment strictly from these intervals.

## Elevation & Depth

This design system avoids all fuzzy drop shadows, ambient blur fields, and skeuomorphic casting.

### Layering Philosophy
- **Physical Document Planes:** Hierarchy is expressed entirely through surface contrast and structural borders.
- **Base Canvas:** The background sits on `#F7F5F0`.
- **Raised Surfaces (Cards, Tables, Panels):** Surfaces sit on `#FFFFFF` and are bounded by a crisp, continuous `1px solid #E3DED3` outline.
- **Modals & Overlays:** Floated panels sit on `#FFFFFF` surrounded by an intentional `2px solid #E3DED3` boundary, over a dimming background wash of `#1F2A37` at 30% opacity.
- **Hover & Active Depth:** Changes in interactive state are signaled through surface tint shifts (`#F7F5F0` background fills on hover) and border color shifts to `#0F5C4D`, never through elevation or shadow enlargement.

## Shapes

The geometric architecture emphasizes tailored structure. The soft rounding provides a contemporary, warm feel while maintaining the structural rigidity of paper forms.

### Corner Radii Guidelines
- **Cards & Data Modules:** Explicitly set to `12px`.
- **Inputs, Buttons, Dropdowns, and Selectors:** Fixed to `8px`.
- **Chips & Status Tags:** Bounded by `4px` or `8px`—never full circular pill shapes.
- **Focus Rings:** Follow the curvature of the focused element with a 2px offset.

## Components

### Iconography
- Icons are strictly **Lucide Outline Icons**, sized at `24px x 24px` with a consistent `1.75px` or `2px` stroke weight.
- Icon color defaults to `#5B6670` in neutral contexts, inheriting `#0F5C4D` for active navigation or semantic colors when signaling validation states.

### Buttons
- **Height & Spacing:** Strict `48px` default height. Horizontal padding is `20px` (`space-md` minus 4px).
- **Border Radius:** `8px`.
- **Primary:** Background `#0F5C4D`, foreground `#FFFFFF`, border `1px solid transparent`. Hover: background `#0A4338`.
- **Secondary (Outlined):** Background `#FFFFFF`, foreground `#0F5C4D`, border `1px solid #0F5C4D`. Hover: background `#F7F5F0`.
- **Tertiary (Ghost):** Background transparent, foreground `#1F2A37`, border `1px solid transparent`. Hover: background `#FFFFFF`, border `1px solid #E3DED3`.
- **Focus State:** Keyboard focus invokes a `2px solid #B7791F` outline with an explicit `2px` outer offset. Never suppress focus rings.

### Input Fields & Controls
- **Height:** Strict `48px` matching buttons.
- **Border & Background:** `1px solid #E3DED3`, background `#FFFFFF`, radius `8px`, typography `15px Inter`.
- **Placeholder:** `#5B6670`.
- **Active Focus:** Border transitions to `1px solid #0F5C4D` accompanied by a `2px solid #B7791F` brass focus ring outline offset by `1px`.
- **Affixes & Currency Signifiers:** Fixed leading prefix boxes (e.g., `ZAR`, `R`) styled in `IBM Plex Mono` with background `#F7F5F0` and separated by `1px solid #E3DED3`.

### Cards & Ledger Sheets
- **Structure:** Background `#FFFFFF`, border `1px solid #E3DED3`, radius `12px`, padding `24px` (`space-md`).
- **Ledger Card Headers:** Crisp hairline separation (`1px solid #E3DED3`) dividing module headings from transaction/metric rows.
- **Data Densities:** Alternating or bordered list rows using `1px solid #E3DED3` bottom dividers.

### Checkboxes & Radios
- **Size:** `20px x 20px` square (`4px` radius) for checkboxes, circular for radios.
- **Border:** `1.5px solid #5B6670` on `#FFFFFF`.
- **Checked:** Background `#0F5C4D`, border `#0F5C4D`, checkmark mark in `#FFFFFF`.
- **Focus:** `2px solid #B7791F` brass outline.

### Status Chips & Badges
- **Height:** `24px` to `28px`, border radius `4px` (or `6px`).
- **Variants:**
  - *Positive/Credit:* Surface `#1E7B4A` with 10% opacity, border `1px solid #1E7B4A`, text `#1E7B4A`.
  - *Caution/Warning:* Surface `#B45309` with 10% opacity, border `1px solid #B45309`, text `#B45309`.
  - *Negative/Alert:* Surface `#B42318` with 10% opacity, border `1px solid #B42318`, text `#B42318`.
  - *Neutral Metric:* Surface `#F7F5F0`, border `1px solid #E3DED3`, text `#1F2A37`.
- **Typography:** `IBM Plex Mono` 12px / 500 weight for metric tags; `Inter` 12px / 500 for status descriptors.

### Metric Displays (Credit Score / Balances)
- Pair an uppercase label in `Inter` (`label-sm`, color `#5B6670`) with an immediate numeric value in `IBM Plex Mono` (`numeric-xl` or `numeric-lg`, color `#1F2A37`).
- Zero ambient drop shadows permitted across all gauges, score summaries, and balance widgets.