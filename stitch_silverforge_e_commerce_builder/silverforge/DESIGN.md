---
name: SilverForge
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#5a4139'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#8e7068'
  outline-variant: '#e2bfb5'
  surface-tint: '#ae3100'
  primary: '#aa3000'
  on-primary: '#ffffff'
  primary-container: '#d04411'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59f'
  secondary: '#595f6a'
  on-secondary: '#ffffff'
  secondary-container: '#dde2f0'
  on-secondary-container: '#5f6570'
  tertiary: '#4f5d70'
  on-tertiary: '#ffffff'
  tertiary-container: '#677689'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59f'
  on-primary-fixed: '#3a0a00'
  on-primary-fixed-variant: '#852400'
  secondary-fixed: '#dde2f0'
  secondary-fixed-dim: '#c1c7d4'
  on-secondary-fixed: '#161c25'
  on-secondary-fixed-variant: '#414752'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-tablet: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system is built on the narrative of the "Digital Forge"—a place where raw commerce data is refined into professional, scalable results. The brand personality is industrious, high-trust, and robust. It targets e-commerce merchants who require a tool that feels as reliable as hardware but as agile as modern software.

The design style is **Corporate / Modern** with a **Tactile** edge. It utilizes a sophisticated monochromatic base (the "Silver") punctuated by high-energy action points (the "Forge"). The UI avoids unnecessary fluff, focusing on extreme data clarity, structured information density, and a sense of "built-to-last" reliability.

## Colors

This design system uses a high-contrast, professional palette designed for long-term focus and clear calls to action.

- **Primary (Forge Ember):** `#F05A28`. A vibrant orange used exclusively for primary actions, critical alerts, and progress indicators. It represents the heat and energy of the forge.
- **Secondary (Deep Slate):** `#272D37`. Used for sidebars, primary navigation, and high-level headings. It provides a grounded, stable foundation.
- **Tertiary (Metallic Silver):** `#94A3B8`. Used for borders, icons, and secondary text. It mimics the sheen of cold steel.
- **Neutral (Workspace White):** `#F8FAFC`. A slightly cool-tinted off-white used for the main canvas to reduce eye strain during extended management sessions.
- **Success/Warning/Error:** Standard semantic tokens apply but should be slightly desaturated to fit the industrial aesthetic, except for Error which shares the intensity of the Forge Ember.

## Typography

The typography strategy pairs **Geist** for structural elements and **Inter** for data-heavy content. 

- **Geist** is used for headings and labels to provide a sharp, technical, and precise feel. Its monospaced-influenced metrics ensure that numbers and headings feel perfectly aligned.
- **Inter** is used for all body copy and data tables. Its high legibility and neutral tone make it ideal for managing complex inventory lists and customer details.
- **Numerical Data:** For dashboards, use tabular lining figures to ensure columns of numbers align perfectly for quick scanning.

## Layout & Spacing

This design system employs a **12-column fluid grid** for the main dashboard and storefront views. The layout is designed to maximize "above the fold" information without feeling cluttered.

- **Grid:** A 12-column layout on desktop, switching to 6-column on tablet and 2-column on mobile.
- **Rhythm:** All spacing (padding, margins) must be multiples of the 4px base unit.
- **Structure:** Content should be housed in "Modules" or "Cells" with a consistent 24px internal padding.
- **Density:** Provide two density modes: "Standard" for storefront management and "Compact" for high-volume inventory and order processing tables.

## Elevation & Depth

To maintain the "Forge" aesthetic, depth is communicated through physical stacking and subtle metallic light sources.

- **Tonal Layering:** The primary background is the Neutral hex. Surface containers (cards, sidebars) use a pure white `#FFFFFF` with a 1px border in Tertiary.
- **Shadows:** Use "Ambient Industrial" shadows. These are low-blur, low-opacity, and slightly weighted towards the bottom to suggest elements are sitting firmly on a surface.
  - *Resting:* `0px 1px 3px rgba(0, 0, 0, 0.1)`
  - *Raised (Hover/Active):* `0px 10px 20px rgba(0, 0, 0, 0.08)`
- **Borders:** Every container should have a subtle 1px border. This reinforces the "constructed" feel of the UI.

## Shapes

The shape language is "Precision Rounded." 

- **Radius:** A standard radius of `0.5rem` (8px) is applied to all primary containers, buttons, and input fields.
- **Large Components:** Use `1rem` (16px) for major dashboard cards and modal overlays.
- **Small Components:** Tags and badges should use a `0.25rem` (4px) radius to maintain a sharper, more data-centric look.
- **Consistency:** Avoid pill-shapes for buttons; keep them rectangular with the standard 8px radius to preserve the robust, industrial feel.

## Components

### Buttons
- **Primary:** Forge Ember background, white text. No gradient, flat color only. 8px radius.
- **Secondary:** Deep Slate background or 1px Slate border with Slate text.
- **State:** On hover, primary buttons shift 10% darker. On click, they shift 10% lighter (mimicking a "strike" on the forge).

### Input Fields
- **Styling:** White background, 1px Tertiary border. Focus state uses a 2px Forge Ember ring with 0% offset.
- **Labels:** Always placed above the input using Geist `label-md`.

### Cards
- **Structure:** 1px border in Tertiary, 8px radius, white background.
- **Header:** Cards should feature a Geist `headline-sm` header with a subtle bottom divider if the card contains a data table.

### Chips & Badges
- **Style:** Square-ish (4px radius). High-contrast background for status (e.g., "In Stock" uses a soft green background with dark green text).

### Data Tables
- **Header:** Deep Slate text on a light silver background.
- **Rows:** 1px bottom border. Hover state on rows should use a very faint silver tint to guide the eye without distracting.

### Progress Indicators
- **Style:** Linear bars using the Forge Ember color to show "heat" or completion of tasks.