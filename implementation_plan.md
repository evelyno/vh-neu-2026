# Vonhoegen Bauunternehmung — Website Redesign (1:1 Reference Clone)

The goal is to rebuild `index.html` into a premium, agency-quality single-page website that serves as an **exact 1:1 structural and stylistic clone** of [findrealestate.com](https://findrealestate.com/), meticulously adapted for the "Vonhoegen Bauunternehmung" use case. 

Every section, typography choice, hover effect, and animation from the reference site will be perfectly replicated.

## User Review Required

> [!IMPORTANT]
> **Design Pivot**: We are discarding the previous "inspired by" approach and moving to a **1:1 exact copy** of the FindRealEstate design language. The entire CSS structure will be rewritten to match the reference site exactly. Please confirm you are happy with this exact replication approach.

> [!WARNING]
> **Content Mapping**: Since FindRealEstate has very specific text structures (e.g., the animated text reveals and asymmetric columns), I will map your existing German copy (Leistungen, Referenzen, Prozess, Über Uns, FAQ) to fit these exact sections. Some text might need slight adjustments later to perfectly fit the visual rhythm of the reference site.

## Open Questions

1. **Colors**: FindRealEstate uses a strict monochromatic palette (Deep Black `#151717`, White `#ffffff`, and Grey `#b3b3b3`). Should we strictly use these exact colors, or do you want to inject the Vonhoegen "Purple" (`#2F267C`) as the primary dark color instead of black?
2. **Hero Animation**: The reference site has a static image hero with cloud animations. We already built a sophisticated scroll-driven 193-frame construction animation. I plan to **keep our scroll animation as the background**, but overlay it with the exact typography, header, and buttons from FindRealEstate. Is this the right approach?

---

## Proposed Changes

### 1. Typography and Global CSS

#### [MODIFY] [index.html](file:///Users/basti/Library/CloudStorage/OneDrive-LudwigDesignInternetservices/Kunden%20Projekte/AI%20Projekte/VH%20Neu/index.html)
- Extract and integrate the exact fonts from FindRealEstate: **Instrument Sans** (primary/headings) and **Lora** (secondary/serif accents).
- Adopt the reference's `vw`-based fluid typography scaling for flawless responsiveness (`font-size: 2.66vw` on mobile, `0.52vw` on desktop).
- Use the exact same Apple-like `cubic-bezier(0.16, 1, 0.3, 1)` easing for all transitions globally.

### 2. Section-by-Section Exact Replication

#### Hero Section (Das Herzstück)
- **Background**: Keep our 193-frame scroll-driven building animation. Fix the canvas preloading bug (load frame 1 immediately, lazy-load the rest).
- **Foreground**: Replicate the "Find What Moves You" massive typography (`clamp()` sizes) and the exact pill-shaped "Find Properties" button with the `scaleX(1.02)` hover transition.

#### "Why FIND" Section ➔ "Warum Vonhoegen"
- Replicate the exact typography layout.
- Implement the specific text highlighting effect where a white/transparent block wipes across the text on scroll.
- Add the auto-playing video preview box positioned on the right.

#### "Real Estate, Rewired" (Asymmetric Columns) ➔ "Leistungen / Prozess"
- Replicate the asymmetric 2-column layout.
- Left column: Massive heading and CTA button.
- Right column: The numbered list (`01`, `02`, `03`) with the grey `.em` text styling for descriptions.

#### "For Agents" (Image Split) ➔ "Karriere / Über Uns"
- Replicate the staggered image blocks and the text revealing layout.
- Apply the exact button styles and spacing.

#### "Testimonials" ➔ "Referenzen / Kundenstimmen"
- Replicate the horizontal swiper carousel exactly.
- Copy the exact card styling, separator lines (`/`), and the cropped preview image on the right side.

### 3. Components & Micro-Interactions

- **Buttons**: Perfectly copy the `.button_button-round` classes, including the text translating up on hover `transform: translateY(-105%)` to reveal duplicate text.
- **Header/Nav**: Implement the exact transparent-to-blur navigation bar with the dropdown hover menus.
- **Scroll Animations**: All elements will fade and slide up exactly as they do on the reference site using Intersection Observers and the `cubic-bezier` easing.

### 4. Code Cleanup

- Remove all legacy CSS from the previous design iterations.
- Inject the heavily optimized CSS layout parsed directly from `findrealestate.css`.

---

## Verification Plan

1. **Visual Match**: Side-by-side comparison with `findrealestate.com` to ensure margins, paddings, fonts, and animations are 100% identical.
2. **Animation Fluidity**: Ensure the frame-scrubbing hero animation performs smoothly alongside the new CSS transitions.
3. **Responsiveness**: Verify the `vw` scaling works perfectly across mobile (375px), tablet, and 4K desktop breakpoints just like the reference site.
