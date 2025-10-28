# PandaHoHo - Travel Discovery Platform

## Project Overview
Complete replica of PandaHoHo (www.pandahoho.com) - a comprehensive travel discovery platform focused on Chinese cities. Built on Replit with PostgreSQL, object storage, Stripe integration, and Replit Auth.

## Recent Changes
**October 28, 2025 - CSV Import Format Updates**
- **Venues CSV Format:**
  - Updated to match user's CSV file format with columns: ID, Title, Cover Image URL, Video URL, Type, Country, City, Description, Tips, Google Maps Embed URL, Google Maps Direct URL, Created Date
  - Added ID column support for updating existing venues (if ID provided) or creating new ones (if empty)
  - Implemented city name to cityId mapping during CSV import
  - Auto-generates slug from Title during import
  - Location field constructed from City and Country values
  - Tips column maps to proTips field in database
- **Triplists CSV Import:**
  - Fixed ID column to properly support update operations when ID is provided in CSV

**October 28, 2025 - Content Settings & Dynamic Dropdowns**
- **Content Settings Feature:**
  - Created new admin page for managing dropdown options used throughout the platform
  - Added three content settings tables: `content_countries`, `content_travel_types`, `content_seasons`
  - Implemented CRUD operations with isActive flags and displayOrder for ordered entities
  - Built ContentSettings admin UI with 3-section grid layout (Countries, Travel Types, Seasons)
  - Added status badges (Active/Inactive) and comprehensive data tables
  - Integrated Content Settings link in admin sidebar with Settings icon
  - Seeded initial data: China, 5 travel types (Hiking, Attractions, Food & Drink, Cultural, Nature), 4 seasons
- **Dynamic Dropdowns:**
  - Updated Venues and Triplists admin modals to fetch dropdown options from API endpoints
  - Country/Type/Season selects now pull from `content_*` tables instead of hardcoded values
  - Dropdowns automatically filter to show only active options
  - Admins can now manage dropdown options without code changes
- **CSV Import Format Update:**
  - Updated Triplists CSV import to match user's format: ID, Title, Country, City, Type, Best Season, Cover Image URL, Video URL, Google Maps Embed URL, Google Maps Direct URL, Description, Related Venues, Created Date
  - Implemented city name to cityId mapping during CSV import
  - Auto-generates slug from title during import
  - Location field constructed from City and Country values

**October 28, 2025 - Enhanced Admin Forms**
- Enhanced venue and triplist admin modals with comprehensive field sets matching reference design
- **Venue Updates:**
  - Added new fields: videoUrl, country, googleMapsEmbedUrl, googleMapsDirectUrl
  - Reorganized form with 3-column grid (Type/Country/City)
  - Added Venue ID display with copy button in edit mode
  - Updated labels: "Title" (emoji support), "Cover Image URL", "Tips"
  - Improved placeholder text with emoji formatting examples
- **Triplist Updates:**
  - Added new fields: country, videoUrl, googleMapsDirectUrl, relatedVenueIds
  - Reorganized form with 2-column grids for better UX
  - Added Triplist ID display with copy button in edit mode
  - Updated labels: "Title *", "Country", "Travel Type", "Best Season to Travel"
  - Added helpful instructions for Google Maps Embed/Direct URLs
  - Added recommendation note for Cover Image URL (1200×800px 3:2 ratio)
  - Added Related Venues field for comma-separated venue IDs
- Database schema synced with new columns

**October 25, 2025**
- Complete platform implementation with all core features
- Designed and built entire frontend with visual-first approach
- Implemented Replit Auth for user authentication
- Created comprehensive admin dashboard with CMS capabilities
- Seeded database with sample cities, triplists, venues, and survival guides
- Configured green accent color scheme (#228B22) with Inter/Playfair Display fonts

## Architecture

### Frontend (React + TanStack Query + Wouter)
- **Pages**: Homepage with hero carousel, Cities browse/detail, Triplists browse/detail with filters, Venue detail pages, Survival Guides, Membership pricing, Admin dashboard
- **Components**: Navigation header, HeroCarousel, CityCard, TriplistCard, GuideCard, GroupUpModal
- **Design System**: 
  - Fonts: Inter (UI) + Playfair Display (headlines)
  - Color: Green primary (#228B22 / hsl(142 76% 36%))
  - Layout: Card-based exploration with visual-first approach
  - Shadows/Borders: Subtle, elevation-based hover states

### Backend (Express + Drizzle ORM + PostgreSQL)
- **Auth**: Replit Auth with OpenID Connect (Google, GitHub, email/password)
- **Storage**: Database-backed session storage with PostgreSQL
- **API Routes**: RESTful endpoints for cities, triplists, venues, guides, group-ups, carousel
- **Validation**: Zod schemas from drizzle-zod for all mutations

### Database Schema
**Tables:**
- `sessions` - Replit Auth session storage
- `users` - User accounts with admin flag
- `cities` - 8 initial Chinese cities with countryId reference
- `venues` - Specific locations within cities
- `triplists` - Curated venue collections
- `triplist_venues` - Many-to-many junction table
- `survival_guides` - Essential travel tips with optional video
- `group_ups` - User-created meetups
- `favorites` - User saved content
- `carousel_items` - Homepage hero slides
- `content_countries` - Manageable country options with isActive flag
- `content_travel_types` - Manageable travel type options with isActive and displayOrder
- `content_seasons` - Manageable season options with isActive and displayOrder

## User Preferences

### Design Philosophy
- **Visual-First**: High-quality imagery with gradient overlays
- **Card-Based**: Consistent aspect ratios (4:3) for all content cards
- **Clean Hierarchy**: Clear typography scale with Inter/Playfair Display
- **Subtle Interactions**: Minimal hover effects (scale 1.02, subtle shadows)
- **No Base44 Badges**: User explicitly requested removal of editor integration badges

### Content Management
- Admin dashboard accessible only to users with `isAdmin: true`
- CMS for cities, triplists, venues, survival guides, carousel, content settings
- CSV bulk upload functionality for efficient data management
- Dynamic dropdown options managed via Content Settings (no hardcoded values)
- Object storage for image uploads (configured, ready for admin integration)
- Sidebar navigation with metric cards
- City name to ID mapping during CSV imports

## Project Structure

```
client/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Shadcn base components
│   │   ├── Navigation.tsx
│   │   ├── HeroCarousel.tsx
│   │   ├── CityCard.tsx
│   │   ├── TriplistCard.tsx
│   │   ├── GuideCard.tsx
│   │   └── GroupUpModal.tsx
│   ├── pages/           # Route pages
│   │   ├── HomePage.tsx
│   │   ├── CitiesPage.tsx
│   │   ├── TriplstsPage.tsx
│   │   ├── TriplistDetailPage.tsx
│   │   ├── VenueDetailPage.tsx
│   │   ├── GuidesPage.tsx
│   │   ├── GuideDetailPage.tsx
│   │   ├── MembershipPage.tsx
│   │   └── admin/       # Admin CMS pages
│   ├── App.tsx
│   └── index.css        # Design tokens
server/
├── db.ts               # Drizzle database connection
├── storage.ts          # Storage interface & implementation
├── routes.ts           # API endpoints
├── replitAuth.ts       # Replit Auth setup
├── seed.ts             # Database seed script
└── index.ts            # Express server
shared/
└── schema.ts           # Drizzle schema & Zod validation
```

## Key Features Implemented

### Public Features
✅ Hero carousel with 3 slides and auto-play
✅ City grid showcase (8 cities)
✅ Triplist browse with category/season filters
✅ Triplist detail pages with venue lists and maps
✅ Venue detail pages with pro tips sidebar
✅ Survival guides with text/video content
✅ Membership pricing page with FAQ accordion
✅ Group-up modal for creating meetups

### Admin Features
✅ Admin dashboard with metrics
✅ Cities management (CRUD)
✅ Triplists management (CRUD with CSV bulk import)
✅ Venues management (CRUD with CSV bulk import)
✅ Survival Guides management (CRUD with CSV bulk import)
✅ Carousel management (add/delete slides with CSV bulk import)
✅ Content Settings (manage Countries, Travel Types, Seasons with CRUD)
✅ Dynamic dropdown options sourced from content settings
✅ Sidebar navigation with protected routes
✅ Admin-only access control
✅ CSV bulk upload with validation and preview for all content types

### Technical Features
✅ Replit Auth integration
✅ PostgreSQL with Drizzle ORM
✅ Object storage provisioned
✅ Responsive design (mobile-first)
✅ Loading states & error handling
✅ Type-safe API with Zod validation
✅ Session-based authentication

## Development Guidelines

### Running the Project
- `npm run dev` - Starts Express + Vite dev servers
- `npm run db:push` - Syncs Drizzle schema to database
- Database is automatically seeded on first run

### Making Changes
- **Frontend**: Edit components in `client/src/`
- **Backend**: Edit routes in `server/routes.ts`
- **Schema**: Update `shared/schema.ts` then run `npm run db:push`
- **Design Tokens**: Modify `client/src/index.css` for colors/shadows

### Important Notes
- Never modify `vite.config.ts` or `server/vite.ts`
- Don't change ID column types (breaks migrations)
- Use `npm run db:push --force` if schema sync fails
- Admin access requires `isAdmin: true` in users table
- Object storage configured at `DEFAULT_OBJECT_STORAGE_BUCKET_ID`

## CSV Import Format

### Triplists CSV Format
Columns: ID (optional), Title, Country, City, Type, Best Season, Cover Image URL, Video URL, Google Maps Embed URL, Google Maps Direct URL, Description, Related Venues, Created Date (optional)

**Notes:**
- **ID column**: If provided, will update the existing triplist with that ID. If empty or omitted, creates a new triplist.
- City names are automatically matched to existing cities in the database
- Slug is auto-generated from Title
- Location field is constructed from City and Country
- Related Venues should be comma-separated venue IDs

### Venues CSV Format
Columns: ID (optional), Title, Cover Image URL, Video URL, Type, Country, City, Description, Tips, Google Maps Embed URL, Google Maps Direct URL, Created Date (optional)

**Notes:**
- **ID column**: If provided, will update the existing venue with that ID. If empty or omitted, creates a new venue.
- City names are automatically matched to existing cities in the database
- Slug is auto-generated from Title
- Location field is constructed from City and Country
- Tips are mapped to the proTips field in the database

## Next Steps / Future Enhancements
- Integrate object storage for image uploads in admin UI
- Add user profile page with favorites
- Implement search functionality across content
- Add Stripe payment integration for membership
- Create more seed data for additional cities
- Add map integration for venue discovery
- Implement group-up RSVP system
- Add social features (comments, reviews)
- Add more content settings categories as needed (e.g., price ranges, difficulty levels)
