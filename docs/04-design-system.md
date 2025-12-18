# 04 - Design System: Stadium vs. Laboratory

## 1. Theme Variables

### Laboratory (Dark Mode)
- **Neutral 900**: `#0a0a0c`
- **Surface**: `rgba(255, 255, 255, 0.03)`
- **Accent**: Royal Blue `#2563eb`
- **Effect**: Deep blurs and neon highlights.

### Stadium (Light Mode)
- **Neutral 50**: `#f8fafc`
- **Surface**: `rgba(255, 255, 255, 0.8)`
- **Accent**: Royal Blue `#2563eb`
- **Effect**: Sharp shadows and clean whitespace.

## 2. Component Specifications

### The Sticker Card
- **Aspect Ratio**: 3:4
- **Corners**: `1.5rem` (24px)
- **Shadow**: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`
- **Interaction**: `scale(1.05)` on hover with `translateY(-8px)`.

### Stat Visualization
- **Type**: Linear Progress Bars.
- **Typography**: Oswald SemiBold for values.
- **Color**: Context-aware (Green for "winner" in battle mode).
