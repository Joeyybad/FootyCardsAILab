
# Styling Guide: High-End Sports Aesthetic

The visual language of FootyCards AI Lab is inspired by premium sports broadcasting (Sky Sports, ESPN) and high-end physical trading cards (Panini Prizm, Topps Chrome).

## Color Palette

### Dark Mode (Default)
- **Primary Background**: `#0a0a0c` (Deep Obsidian)
- **Accent Primary**: `#2563eb` (Royal Blue)
- **Glass Surfaces**: `rgba(255, 255, 255, 0.03)` with `backdrop-blur-md`
- **Typography**: White (`#ffffff`) for headers, Gray (`#9ca3af`) for secondary.

### Light Mode (Day Mode)
- **Primary Background**: `#f8fafc` (Slate 50)
- **Accent Primary**: `#2563eb` (Royal Blue)
- **Glass Surfaces**: `rgba(255, 255, 255, 0.7)` with `backdrop-blur-lg` and border `#e2e8f0`.
- **Typography**: Slate 900 (`#0f172a`) for headers, Slate 500 (`#64748b`) for secondary.

## Typography
- **Headings**: `Oswald` (Sans-serif, condensed, bold) - used for names, positions, and big numbers.
- **Body**: `Inter` (Clean, modern sans-serif) - used for descriptions and UI labels.

## Components
- **The Card**: Aspect ratio 3:4. Rounded corners (2xl). Border thickness 1px.
- **Rarity Effects**: 
  - Legendary cards feature a "shimmer" animation (`card-shimmer` class) and a gold border glow.
- **Stat Bars**: Minimalist horizontal bars with percentage-based filling.

## UI Principles
- **Dual Theme Support**: Users can toggle between "Laboratory" (Dark) and "Stadium" (Light) modes.
- **Grid Layout**: Responsive grid that adapts from 2 to 5 columns.
- **Interactivity**: Hover states should include a slight lift (-y translation) and scale increase.
