---
name: ORRA BIT
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c9c6c5'
  secondary: '#5d5e66'
  on-secondary: '#ffffff'
  secondary-container: '#e3e1ec'
  on-secondary-container: '#63646c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1e'
  on-tertiary-container: '#838487'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e3e1ec'
  secondary-fixed-dim: '#c6c5cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#46464e'
  tertiary-fixed: '#e2e2e5'
  tertiary-fixed-dim: '#c6c6c9'
  on-tertiary-fixed: '#1a1c1e'
  on-tertiary-fixed-variant: '#454749'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display:
    fontFamily: Bodoni Moda
    fontSize: 72px
    fontWeight: '400'
    lineHeight: 80px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Bodoni Moda
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 46px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.12em
  editorial-quote:
    fontFamily: Bodoni Moda
    fontSize: 22px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.01em
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 4rem
  margin-tablet: 2rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 2rem
  space-xl: 4rem
---

## Brand & Style
The brand embodies an uncompromising, modern luxury aesthetic defined by architectural minimalism, restraint, and tension between editorial expression and stark digital precision. It speaks to a discerning, culturally fluent demographic that values curation over abundance, quiet confidence over noise, and exacting craft in every pixel.

The interface evokes serenity, museum-grade spaciousness, and authoritative polish. The design style combines High-Contrast Modern Editorial with Minimalist Spatial Restraint. Tactility is achieved not through artificial drop shadows or physical skeuomorphism, but through hair-thin structural boundaries, precise type scales, subtle transition friction, and generous negative space reminiscent of an elite art monograph.

## Colors
The palette is hyper-disciplined monochrome, prioritizing visual clarity and letting product photography command the viewer's focus.

- **Primary Background (`#FFFFFF`):** Pristine white serving as the digital canvas, maximizing clarity and editorial breathing room.
- **Deep Contrast Typography & Accents (`#0A0A0A` / `#111111`):** Absolute jet black for headers, critical callouts, primary buttons, and solid active states.
- **Secondary Tone (`#71717A`):** Neutral slate zinc for secondary metadata, product SKUs, muted labels, and non-active icons.
- **Structural Dividing Tones (`#E4E4E7` & `#F4F4F5`):** Subtle hair-line borders, passive card containers, and secondary hover backgrounds that define shape without introducing visual clutter.

No decorative saturation or chromatic gradients are permitted. Functional alert states must follow minimal, muted grayscale shifts or ultra-refined line badges rather than saturated alert banners.

## Typography
The typographic system pairs high-fashion Italian transitional serif typography (`Bodoni Moda`) for dramatic editorial headlines and hero statements with razor-sharp, balanced geometric grotesk (`Hanken Grotesk`) for functional interface copy, navigations, labels, and product metadata.

Display and large headlines favor lowercase elegance or title casing with generous breathing room. UI labels, prices, filter actions, and status pills are rendered in uppercase `Hanken Grotesk` with expanded letter-spacing (8% to 12%) to evoke luxury catalog provenance. Line heights remain generous across all body copy to safeguard legibility against sharp black-and-white contrast.

## Layout & Spacing
The layout adheres to a 12-column architectural grid on desktop (`1440px+` max canvas with dynamic outer margins), shifting to an 8-column layout on tablet (`768px - 1023px`), and a 4-column layout on mobile devices (`<768px`).

- **Grid Rhythms:** Standard desktop catalog displays use a 4-column or 3-column configuration (`col-span-3` or `col-span-4`), collapsing to 2 columns on tablet and 1 or 2 columns on mobile depending on editorial emphasis.
- **Asymmetric Offsets:** Lookbooks and collection features occasionally break strict horizontal alignment by staggering image cards across 5-column and 7-column splits.
- **Horizontal & Vertical Pacing:** Whitespace must be preserved intentionally. Outer section spacing uses `space-xl` as a baseline; micro-spacing within interactive elements relies tightly on `space-xs` through `space-md` to maintain compact utility inside generous macroscopic voids.

## Elevation & Depth
Depth in this design system is strictly non-skeuomorphic and flat. Drop shadows, colored glows, and heavy elevation blurs are forbidden.

Hierarchy and separation are achieved exclusively through:
1. **Hairline Outlines:** 1px borders using `#E4E4E7` to frame containers, split table views, and define imagery wrappers.
2. **Tonal Planar Overlays:** Quick-add sheets and slide-over drawers use pure `#FFFFFF` surfaces stacked directly over the viewport, isolated by a semi-translucent backdrop (`rgba(10, 10, 10, 0.4)`) with minimal backdrop-filter blur (`4px`).
3. **Hover Depths:** Hover states never push elements outward with elevation shadows; instead, subtle opacity transitions, fine line inversions, and internal media zoom scaling (`scale(1.03)`) communicate response and feedback.

## Shapes
The shape language is strictly architectural and sharp (`roundedness: 0`). 

All buttons, image frames, input fields, popovers, badges, and modal overlays possess crisp 90-degree corners (`0px` border-radius). This deliberate severity reinforces haute couture minimalism, editorial gallery standards, and structural modernism. Circular shapes are permissible only for small interactive iconography (such as the minimal floating wishlist heart button) or single-character pagination indicators to provide deliberate focal tension against rectilinear framing.

## Components

### Buttons
- **Primary:** Solid `#0A0A0A` background, `#FFFFFF` text, 0px border radius, 48px height. Text style: `label-md` (uppercase, tracked). On hover: background shifts to `#27272A` with a smooth 200ms ease transition.
- **Secondary / Outline:** Transparent background, 1px solid `#0A0A0A` border, `#0A0A0A` text. On hover: inverts completely to solid `#0A0A0A` with `#FFFFFF` text.
- **Tertiary / Text:** No border, uppercase `label-sm`, with an animated 1px underline that expands from center to edges on hover.

### Product Cards
- **Structure:** Framed with an optional 1px hairline border (`#E4E4E7`) or borderless with generous cell gaps. 
- **Aspect Ratio:** Fixed 3:4 or 4:5 vertical proportions for product portraits. Image features a smooth zoom transition (`transform 400ms cubic-bezier(0.16, 1, 0.3, 1)`).
- **Wishlist Badge:** Circular icon container (36px × 36px) placed at top-right, featuring a 1px border (`#E4E4E7`), white background, and a sharp minimal heart glyph (`#0A0A0A`). On hover: scales slightly to 1.08x with hairline outline darkening.
- **Quick-Add Overlay:** Slides up from the bottom of the card on hover (hidden by default on desktop, persistent bottom row or drawer trigger on touch screens). Features instant single-click size selector pills (`XS`, `S`, `M`, `L`, `XL`) rendered in pure white against a black panel.
- **Metadata Area:** Left-aligned item title in `body-md` paired with right-aligned price in `label-md`.

### Form Inputs & Text Fields
- **Input Fields:** Flat rectangular baseline or full 1px box in `#E4E4E7`. 44px height, padding `space-sm` `space-md`. Typography uses `body-md`. Focus state transitions the border to `#0A0A0A` without ring halo or drop shadow.
- **Checkboxes & Radio Buttons:** 16px square or circular boxes with 1px `#0A0A0A` border. Checked state renders a pure black fill with a crisp white mark.

### Chips & Filter Tags
- Rectangular 32px height chips with 1px border in `#E4E4E7`. Inactive: `#FFFFFF` fill, `#71717A` text. Active/Selected: solid `#0A0A0A` fill, `#FFFFFF` text.

### Navigation & Editorial Drawers
- **Global Header:** Fixed/sticky height of 72px, `#FFFFFF` background with an ultra-fine bottom rule (`#F4F4F5`). Centralized logotype with spaced navigation anchors (`label-sm`).
- **Cart & Filter Drawers:** Slide-in from right edge, 420px fixed desktop width, crisp 1px left border, layered cleanly above the content canvas.