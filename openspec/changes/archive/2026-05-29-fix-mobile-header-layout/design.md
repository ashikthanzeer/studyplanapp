## Context

The mobile top header bar (`.mobile-header`) currently uses a relative/sticky hybrid position with negative margins. This is causing it to fail to stick consistently, leave empty margins on the sides, and fail to sit at the absolute top of the viewport.

## Goals / Non-Goals

**Goals:**
- Fix `.mobile-header` positioning to be fixed (`position: fixed`) at `top: 0` and `left: 0`.
- Ensure it spans the full viewport width (`width: 100%`) with standard box-sizing.
- Clean up negative margins (`margin-top`, `margin-left`, `margin-right`) from `.mobile-header`.
- Offset the scrolling content by adding `padding-top` to `.main-content` on mobile.

**Non-Goals:**
- Modifying React code or markup structure.

## Decisions

### Decision 1: Use position: fixed instead of position: sticky with negative margins
- **Chosen Option:** Apply `position: fixed; top: 0; left: 0; width: 100%; box-sizing: border-box;` on `.mobile-header`.
- **Rationale:** Sticky positioning inside a flex layout with custom paddings makes the top header behavior unpredictable. Fixed positioning completely detaches it from the document flow, making it trivial to align it at the absolute top and span 100% width.

### Decision 2: Set offset padding on the scrolling container
- **Chosen Option:** Set `.main-content { padding-top: 72px !important; }` inside the media query.
- **Rationale:** Pushes the scrolling dashboard and tasks down by the height of the fixed header (56px) plus spacing (16px), preventing content clipping.

## Risks / Trade-offs

- **[Risk] Header overlaps sidebar drawer or bottom nav** → **[Mitigation]** Set `.mobile-header` `z-index` to `98`. The sidebar has `z-index: 100` and mobile bottom nav has `z-index: 999`, ensuring they lay on top correctly.
