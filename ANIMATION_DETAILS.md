# Animation Architecture - Step 2

## Shared Element Transition Flow

### Animation Timeline (0.7 seconds total)

```
Time: 0.0s ──────────────────────────── 0.7s

┌─────────────────────────────────────┐
│ Hero Image Shared Element Transition │
├─────────────────────────────────────┤
│ • Position: Source → Panel Position  │
│ • Size: Card Size → Panel Size       │
│ • Opacity: Fade in                   │
│ • Easing: power3.inOut               │
│ • Duration: 0.7s                     │
└─────────────────────────────────────┘

        ┌─────────────────────────────────────┐
        │ Panel Slide Animation                │
        ├─────────────────────────────────────┤
        │ • Transform: translateX(100%) → 0   │
        │ • Duration: 0.7s                    │
        │ • Easing: power3.inOut              │
        │ • Background opacity: 0 → 1         │
        └─────────────────────────────────────┘

        ┌─────────────────────────────────────┐
        │ Main Grid Effect                     │
        ├─────────────────────────────────────┤
        │ • Blur: 0px → 4px                   │
        │ • Scale: 1 → 0.98                   │
        │ • Duration: 0.6s                    │
        │ • Easing: power3.inOut              │
        └─────────────────────────────────────┘
```

## Close Animation (Reverse)

```
Time: 0.0s ──────────────────────────── 0.7s

┌─────────────────────────────────────┐
│ Hero Image Returns to Card           │
├─────────────────────────────────────┤
│ • Position: Panel Position → Source  │
│ • Size: Panel Size → Card Size       │
│ • Duration: 0.7s                     │
│ • Easing: power3.inOut               │
└─────────────────────────────────────┘

        ┌─────────────────────────────────────┐
        │ Panel Slide Out                      │
        ├─────────────────────────────────────┤
        │ • Transform: 0 → translateX(100%)   │
        │ • Duration: 0.7s                    │
        │ • Easing: power3.inOut              │
        │ • Background opacity: 1 → 0         │
        └─────────────────────────────────────┘

        ┌─────────────────────────────────────┐
        │ Main Grid Returns                    │
        ├─────────────────────────────────────┤
        │ • Blur: 4px → 0px                   │
        │ • Scale: 0.98 → 1                   │
        │ • Duration: 0.6s                    │
        │ • Easing: power3.inOut              │
        └─────────────────────────────────────┘
```

## GSAP Implementation Details

### PropertyDetailPanel.tsx - animateIn()

```typescript
const timeline = gsap.timeline();

// 1. Background dim (0s - 0.6s)
timeline.fromTo(
  panelRef.current,
  { opacity: 0 },
  { opacity: 1, duration: 0.6, ease: "power3.inOut" },
  0
);

// 2. Main grid blur & scale (0s - 0.6s)
timeline.fromTo(
  "main > section:first-child",
  { filter: "blur(0px)", transform: "scale(1)" },
  { filter: "blur(4px)", transform: "scale(0.98)", duration: 0.6, ease: "power3.inOut" },
  0
);

// 3. Panel slide from right (0s - 0.7s)
timeline.fromTo(
  panelRef.current,
  { x: "100%" },
  { x: 0, duration: 0.7, ease: "power3.inOut" },
  0
);

// 4. Shared element transition (0s - 0.7s)
// Hero image morphs from source card position to panel position
timeline.fromTo(
  heroImageRef.current,
  { left: sourceRect.left, top: sourceRect.top, width: sourceRect.width, height: sourceRect.height },
  { left: targetRect.left, top: targetRect.top, width: targetRect.width, height: targetRect.height },
  { duration: 0.7, ease: "power3.inOut" },
  0
);
```

### PropertyDetailPanel.tsx - animateOut()

```typescript
const timeline = gsap.timeline();

// Reverse all animations
timeline.to(panelRef.current, { opacity: 0, duration: 0.6, ease: "power3.inOut" }, 0);
timeline.to("main > section:first-child", { filter: "blur(0px)", transform: "scale(1)", duration: 0.6, ease: "power3.inOut" }, 0);
timeline.to(panelRef.current, { x: "100%", duration: 0.7, ease: "power3.inOut" }, 0);
timeline.to(heroImageRef.current, { left: sourceRect.left, top: sourceRect.top, width: sourceRect.width, height: sourceRect.height }, { duration: 0.7, ease: "power3.inOut" }, 0);
```

## Event Flow

### Opening the Panel

```
1. User clicks PropertyCard
   ↓
2. PropertyCard calls onPropertyClick(property, imageRef)
   ↓
3. page.tsx stores:
   - selectedProperty (PropertyDetail)
   - sourceImageRef (HTMLDivElement)
   ↓
4. PropertyDetailPanel renders (property != null)
   ↓
5. useEffect triggers animateIn()
   ↓
6. GSAP timeline starts:
   - Background fades in
   - Grid blurs & scales
   - Panel slides from right
   - Hero image morphs
   ↓
7. Panel is interactive
```

### Closing the Panel

```
1. User clicks back arrow
   ↓
2. handleBackClick() calls animateOut()
   ↓
3. GSAP timeline reverses all animations
   ↓
4. After 700ms, onClose() called
   ↓
5. page.tsx clears:
   - selectedProperty (set to null)
   - sourceImageRef (set to null)
   ↓
6. PropertyDetailPanel unmounts (property == null)
```

## Performance Optimizations

1. **Animation Prevention**
   - `isAnimatingRef` prevents multiple simultaneous animations
   - Ensures smooth, single animation queue

2. **DOM Optimization**
   - Only mounts when property is not null
   - Cleans up GSAP on unmount
   - Prevents memory leaks

3. **willChange Property**
   - Applied to hero image for GPU acceleration
   - Improves animation performance

4. **useCallback for Event Handlers**
   - Stable function references
   - Prevents unnecessary re-renders

## Browser Support

- Chrome/Edge: Full support (Chromium-based)
- Firefox: Full support
- Safari: Full support
- Mobile Safari: Full support

## Accessibility

- ✅ Back arrow has proper aria-label
- ✅ Scroll prevented at document level
- ✅ Keyboard focus managed
- ✅ Color contrast maintained

## Future Enhancements

1. Add swipe gesture to close (mobile)
2. Add keyboard navigation (Escape to close)
3. Add preload for gallery images
4. Add custom scroll behavior for gallery
5. Add image lightbox for gallery
