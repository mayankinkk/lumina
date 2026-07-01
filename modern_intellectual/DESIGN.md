---
name: Modern Intellectual
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#45464e'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#75777e'
  outline-variant: '#c6c6ce'
  surface-tint: '#525e7f'
  primary: '#182442'
  on-primary: '#ffffff'
  primary-container: '#2e3a59'
  on-primary-container: '#98a4c9'
  inverse-primary: '#bac6ec'
  secondary: '#5f5e5b'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdb'
  on-secondary-container: '#63635f'
  tertiary: '#0d2b1c'
  on-tertiary: '#ffffff'
  tertiary-container: '#244131'
  on-tertiary-container: '#8cad98'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#bac6ec'
  on-primary-fixed: '#0d1a38'
  on-primary-fixed-variant: '#3a4666'
  secondary-fixed: '#e4e2dd'
  secondary-fixed-dim: '#c8c6c2'
  on-secondary-fixed: '#1b1c19'
  on-secondary-fixed-variant: '#474744'
  tertiary-fixed: '#c9ebd4'
  tertiary-fixed-dim: '#adceb8'
  on-tertiary-fixed: '#022113'
  on-tertiary-fixed-variant: '#2f4d3c'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Literata
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 52px
  display-lg-mobile:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-reading:
    fontFamily: Literata
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-ui:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  container-max: 1120px
  reading-width: 680px
---

## Brand & Style
The design system is anchored in the "Modern Intellectual" aesthetic, a philosophy that prioritizes cognitive ease and deep focus. The target audience consists of researchers, students, and lifelong learners who require a digital environment that mimics the contemplative nature of a private library. 

The style combines **Minimalism** with **Tonal Layering**. It avoids heavy shadows or aggressive gradients, opting instead for a "digital parchment" experience. The emotional response should be one of quiet confidence, clarity, and scholarly rigor. Interfaces are intentionally sparse to eliminate "UI noise," ensuring that the AI insights and the primary text remain the focal points.

## Colors
The palette is engineered for long-form reading and low eye strain. 

- **Primary (Scholarly Indigo):** Used for interactive elements, primary call-to-actions, and active states. It conveys authority and depth.
- **Secondary (Parchment):** The foundational background color. It is a soft off-white that reduces the harsh contrast of pure white, mimicking high-quality paper.
- **Tertiary (Sage Green):** Reserved for success states, progress indicators, and "completion" milestones.
- **Neutral (Deep Charcoal):** Used for primary body text and UI labels to ensure WCAG AAA legibility against the parchment background.

Avoid using pure black (#000000) to maintain the sophisticated, organic feel of the system.

## Typography
This design system utilizes a dual-font strategy to distinguish between content and utility.

- **Literata** is the workhorse for reading. It features a generous x-height and specific optimizations for digital screens, making it ideal for the AI-generated summaries and original book text.
- **Plus Jakarta Sans** provides a crisp, modern contrast for the functional UI. It is used for navigation, buttons, and metadata.

**Hierarchy Rules:**
- Use `display-lg` for book titles and major section headers.
- `body-reading` should always maintain a line-height of at least 1.6x to ensure readability.
- `label-caps` should be used sparingly for category tags or small metadata headers to provide a rhythmic break in the layout.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop to prevent line lengths from becoming too long, which fatigues the reader. 

- **Reading Well:** Content-heavy pages center the text in a 680px "reading well" to maximize focus.
- **Margins:** Large outer margins (xxl) are encouraged on desktop to create a sense of breathing room.
- **Mobile:** Transition to a fluid layout with 20px side margins. 
- **Vertical Rhythm:** Use the `xl` (40px) unit to separate major conceptual blocks, ensuring the UI never feels crowded.

## Elevation & Depth
In alignment with the "Modern Intellectual" theme, elevation is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Base):** The Parchment background.
- **Level 1 (Cards/Surface):** A slightly lighter or darker tint of Parchment with a 1px border in a muted charcoal (opacity 10%).
- **Level 2 (Popovers/Modals):** Subtle ambient shadows (0px 4px 20px, 5% opacity charcoal) to provide just enough lift to separate the element from the reading plane.

The goal is to keep the interface "flat-but-tactile," similar to sheets of paper stacked on a desk.

## Shapes
The design system uses **Soft** roundedness. Extreme rounding (pill shapes) is avoided as it feels too "playful" for a scholarly tool. 

- **Standard Elements:** 0.25rem (4px) corner radius for input fields and small buttons.
- **Container Elements:** 0.5rem (8px) for cards and modals.
- **Selection States:** Use subtle background fills with the Soft radius rather than heavy outlines.

## Components
- **Buttons:** Primary buttons use the Scholarly Indigo background with Parchment text. Ghost buttons use an Indigo outline and no fill. All buttons use `body-ui` typography.
- **Cards:** Use a 1px border (Charcoal at 10% opacity) with no background fill or a very subtle tint. Padding should be generous (`lg`).
- **Progress Indicators:** Use the Sage Green for progress bars. These should be thin (4px height) and unobtrusive, appearing at the top of the reading well or within book covers.
- **Input Fields:** Minimalist design with only a bottom border that thickens and changes to Indigo on focus. No heavy boxes.
- **Chips/Tags:** Used for "Keywords" or "Topics." These should have a light Indigo tint and use `label-caps` typography.
- **AI Insights:** Specialized containers for AI-generated text. Use a vertical Indigo line (2px wide) on the left margin to denote "AI Assistance" without cluttering the UI with icons.