## Why

The mobile top header navigation bar does not stick to the top of the viewport when scrolling, does not start at the very top of the page, and does not span the full viewport width. This creates a disjointed user interface.

## What Changes

- Modify CSS styling for `.mobile-header` on mobile viewports to use `position: fixed` at `top: 0` and `left: 0` with `width: 100%` and `box-sizing: border-box`.
- Remove the negative margins on `.mobile-header` which were causing scaling and viewport margin overflow issues.
- Add offset `padding-top` to `.main-content` on mobile viewports to push the scrollable body content below the fixed header cleanly.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mobile-sidebar-navigation`: The requirements for the mobile top header are modified to ensure it remains fixed at the absolute top of the viewport and spans the entire width.

## Impact

- Styles: CSS positioning and container adjustments will be made in `App.css`.
