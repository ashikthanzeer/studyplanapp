## 1. Style Adjustments for Mobile Header

- [x] 1.1 Modify `.mobile-header` CSS in `App.css` to use fixed positioning (top: 0, left: 0, width: 100%, z-index: 98, box-sizing: border-box)
- [x] 1.2 Remove the relative positioning and buggy negative margins from `.mobile-header`

## 2. Offset Spacing

- [x] 2.1 Add `padding-top: 72px !important` offset to `.main-content` inside the mobile media query in `App.css` to accommodate the fixed header

## 3. Verification

- [x] 3.1 Run build script and verify header remains fixed, covers full width, and positions content properly without overlap
