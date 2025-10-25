# PandaHoHo Travel Platform - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from Airbnb's card-based exploration patterns, combined with modern travel platforms like Atlas Obscura and Culture Trip. The design emphasizes visual storytelling through photography while maintaining clean information hierarchy for practical travel content.

**Design Principles**:
- Visual-first exploration with high-quality imagery
- Clean, scannable content for practical information
- Trust-building through authentic travel photography
- Intuitive navigation for multi-faceted content types

## Typography

**Font Families**:
- Primary: Inter (400, 500, 600, 700) - for UI elements, navigation, and body text
- Accent: Playfair Display (600, 700) - for hero headlines and featured content titles

**Type Scale**:
- Hero Headlines: 48-64px (Playfair Display, 600)
- Page Titles: 32-40px (Inter, 700)
- Section Headers: 24-28px (Inter, 600)
- Card Titles: 18-20px (Inter, 600)
- Body Text: 16px (Inter, 400)
- Captions/Meta: 14px (Inter, 500)
- Navigation: 15px (Inter, 500)

## Layout System

**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24, 32
- Micro spacing (between related elements): 2, 4
- Component internal spacing: 6, 8
- Section padding: 12, 16, 20
- Major section breaks: 24, 32

**Grid System**:
- Container: max-w-7xl with px-6 lg:px-8
- City/Triplist/Guide Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
- Two-column layouts: grid-cols-1 lg:grid-cols-2 gap-12
- Content max-width: max-w-4xl for reading content

## Component Library

### Navigation Header
- Fixed/sticky header with subtle shadow on scroll
- Logo (left), navigation items (center/right), Sign In button (right)
- Height: 64px desktop, 56px mobile
- Background with subtle backdrop blur when over images

### Hero Carousel
- Full-width sections at 70vh minimum
- Image overlay with gradient (bottom-to-top or center radial)
- Carousel controls: Arrow buttons (left/right) with backdrop blur
- Dot indicators centered at bottom
- Content overlay: Centered or left-aligned with max-w-2xl

### City/Content Cards
- Aspect ratio 4:3 for thumbnails
- Rounded corners: rounded-xl (12px)
- Hover effect: subtle scale (1.02) and shadow increase
- Image with gradient overlay for text readability
- Content padding: p-6
- Category/season badges: rounded-full px-3 py-1 text-sm

### Detail Pages Layout
- Hero image: Full-width at 50-60vh with gradient overlay
- Content section: Two-column on desktop (8/4 split)
  - Main content (left): Article-style with max-w-3xl
  - Sidebar (right): Pro tips, share, CTA buttons with sticky positioning
- Back navigation: Breadcrumb or back button above hero
- Map embeds: Rounded container with 16:9 aspect ratio

### Survival Guides
- Video badge indicator on card thumbnails
- Guide cards with preview text (2-3 lines truncated)
- Detail page: Video embed at top, followed by formatted content
- Emoji-rich formatting for readability

### Admin Dashboard
- Sidebar navigation: Width 240px, organized sections with headers
- Metric cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Card design: Padding p-6, rounded-lg, with icon, number (large), label, and growth indicator
- Growth indicators: Small badge showing percentage with up/down arrow

### Forms & Modals
- Modal overlay: Backdrop blur with opacity
- Modal container: max-w-2xl, rounded-2xl, shadow-2xl
- Form fields: Rounded-lg borders, focus rings with platform accent
- Input height: h-12 for text inputs
- Buttons: h-11 with rounded-lg

### Group Up Modal
- Date/time picker with calendar interface
- Venue dropdown with search/filter
- Auto-filled meeting point (read-only with edit option)
- Participation fee input with currency symbol
- Submit button: Full-width, prominent

## Images

**Required Images**:

1. **Homepage Hero Carousel** (3-5 slides):
   - High-quality cityscape/landmark photos
   - Dimensions: 1920x1080 minimum
   - Examples: Beijing skyline from Jingshan, Shanghai Bund at night, Chengdu pandas, Chongqing night view

2. **City Grid Cards** (8 cities):
   - Representative city imagery
   - Dimensions: 800x600
   - Should capture city character (historical, modern, cultural)

3. **Triplist Cards**:
   - Featured location from the triplist
   - Dimensions: 800x600
   - Clear, inviting travel photography

4. **Venue Detail Hero**:
   - Hero image: 1600x900
   - Showcase the venue's best angle/feature

5. **Survival Guide Thumbnails**:
   - Illustrative images related to guide topic
   - Dimensions: 600x400
   - Can include screenshots or conceptual travel imagery

**Image Treatment**:
- All card images: Subtle gradient overlay (bottom 40%, opacity 0.6)
- Hero images: Gradient overlay for text readability
- Maintain high quality - no compression artifacts
- Aspect ratios strictly maintained for consistency

## Animations

Use sparingly and purposefully:
- Card hover: scale transform (1.02) with 200ms ease
- Carousel transitions: Smooth fade or slide (400ms)
- Modal entrance: Fade in with slight scale (300ms)
- No page transition animations
- No scroll-triggered animations except lazy loading

## Accessibility

- Maintain 4.5:1 contrast ratio for all text
- Focus states: Visible ring with 2px offset
- All interactive elements: min-height 44px for touch targets
- Form labels: Always visible, not placeholder-only
- Alt text for all images with descriptive content
- Skip navigation link for keyboard users
- Semantic HTML structure throughout