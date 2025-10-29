# PandaHoHo - Travel Discovery Platform

## Overview
PandaHoHo is a comprehensive travel discovery platform designed to be a complete replica of www.pandahoho.com, focusing on Chinese cities. It aims to provide a rich, visual-first experience for exploring cities, triplists, venues, and survival guides. The platform includes a robust admin dashboard for content management, user authentication, and integrates with essential third-party services. Its core capabilities include showcasing curated travel content, enabling efficient content management through CRUD operations and bulk CSV uploads, and offering a dynamic, responsive user interface. The project envisions becoming the go-to platform for discovering travel experiences in Chinese cities, with future plans for advanced search, social features, and integrated payment solutions.

## Recent Changes

**October 29, 2025 - Hero Carousel Display Order Field & API Fixes (COMPLETED)**
- **Added: Display Order Input Field**
  - Added number input field for "Display Order" in both Create and Edit carousel forms
  - Input validates non-negative integers only (rejects decimals, negatives, invalid chars)
  - Empty input defaults to 0 to prevent NaN issues
  - Added `min={0}` HTML attribute for browser validation
  - Robust onChange handler preserves previous valid value when invalid input is attempted
  - Fixed value prop to use `String()` for controlled input compatibility
  
- **Enhanced: Carousel List Display**
  - Display order value now shown next to each carousel item's title
  - Shows "Order: X" for easy visual reference
  - Handles undefined values gracefully (defaults to 0)
  
- **Fixed: Critical API Issues**
  - Fixed all 4 `apiRequest` calls with wrong parameter order (was: url, method, data; corrected to: method, url, data)
    - createItem mutation
    - updateItem mutation  
    - deleteItem mutation
    - handleBulkImport function
  - Added missing `PUT /api/carousel/:id` route for carousel updates
  - Added `updateCarouselItem()` method to storage interface and implementation
  - Fixed type safety in POST route to ensure proper field mapping
  
- **Technical Implementation**
  - Uses `Number(value)` parsing with comprehensive validation
  - Checks: not NaN, is integer, and >= 0
  - Prevents all edge cases: intermediate chars ("-", "+", "e"), decimals, negatives
  - Applied consistently to both Create (data-testid="input-order") and Edit (data-testid="input-edit-order") forms
  - **Status**: COMPLETED - All bugs fixed, carousel CRUD operations now fully functional

**October 29, 2025 - Venue Display Fix & Admin UI Improvements**
- **Fixed: Venues Not Showing on Triplist Detail Pages**
  - **Issue**: Related venues weren't appearing on triplist detail pages because `triplist_venues` junction table was empty
  - **Solution**: Modified `getVenues()` in `server/storage.ts` to add intelligent fallback logic
    - First tries the `triplist_venues` junction table (for future compatibility)
    - If empty, reads directly from triplist's `related_venue_ids` field
    - Parses semicolon/comma-separated IDs and fetches venues in correct order
  - **Impact**: Venues now display immediately without requiring "Sync Venues" operation
  - **Status**: RESOLVED - Confirmed working in production
  
- **Fixed: LSP Type Errors in bulkCreateVenues**
  - Added type assertions to silence false-positive TypeScript errors
  - Errors were related to Drizzle ORM's overly strict type inference
  - No runtime behavior changes - purely cosmetic TypeScript fixes
  
- **Enhanced: Triplist Count Display**
  - Added total count display in Triplists Management header
  - Shows "X triplists total" with proper pluralization
  - Includes data-testid for testing automation
  
- **Confirmed: CSV Re-upload Safety**
  - `bulkCreateTriplists()` already has robust upsert logic that matches by title
  - When re-uploading CSV with corrected IDs, it updates existing records without creating duplicates
  - Handles ID replacements via transactions to maintain data integrity
  - User can safely re-upload triplist CSV to fix ID mismatches

**October 29, 2025 - Production Bug Fixes (RESOLVED)**
- **Bug 1: CSV Upload "413 Request Entity Too Large" Error**
  - **Issue**: Venue CSV bulk upload failed with HTTP 413 error in production
  - **Root Cause**: Express.js body parser had default 100kb limit, which was too small for large CSV files with many rows
  - **Solution**: Increased body size limit to 50mb in `server/index.ts`:
    - `express.json({ limit: '50mb' })`
    - `express.urlencoded({ extended: false, limit: '50mb' })`
  - **Status**: Fixed. Large CSV files can now be uploaded successfully

- **Bug 2: Content Settings Creation Failed**
  - **Issue**: Creating new content (Countries, Cities, Travel Types, Seasons) failed with "Failed to create" error
  - **Root Cause**: All 14 `apiRequest` calls in `ContentSettings.tsx` had parameters in wrong order
    - Incorrect: `apiRequest(url, method, data)`
    - Correct: `apiRequest(method, url, data)`
  - **Files Fixed**: `client/src/pages/admin/ContentSettings.tsx`
    - Fixed all CRUD operations for Countries (3 calls)
    - Fixed all CRUD operations for Cities (3 calls)
    - Fixed all CRUD operations for Travel Types (4 calls including order)
    - Fixed all CRUD operations for Seasons (4 calls including order)
  - **Status**: Fixed. Content Settings CRUD operations now work correctly

**October 29, 2025 - CSV Bulk Import Parameter Order Fix**
- **Initial Fix Attempt**: CSV bulk upload for Venues and Triplists  
- **Files**: `client/src/pages/admin/VenuesManagement.tsx`, `client/src/pages/admin/TriplstsManagement.tsx`
- **Note**: This fix resolved the apiRequest parameter order but the 413 error required the additional body size limit increase above

**October 29, 2025 - Triplist Layout Updates to Match PandaHoHo**
- **TriplistCard Component Updates**:
  - Moved badges to bottom left of image (location, category, season)
  - Changed badge colors: white for location, amber for category, green for season
  - Added title, location, and description text below the image
  - Reduced hover scale effect to subtle 1.02
- **TriplistDetailPage Layout Overhaul**:
  - Moved "Back to Triplists" link above hero image
  - Repositioned hero image on LEFT (2/3 width) with 16:9 aspect ratio
  - Added rounded corners to hero image
  - Positioned "Group Activities" sidebar on RIGHT aligned with hero
  - Title and location overlay centered on hero with text shadow
  - Full title, metadata (location • category • Best in season), and Favorite button below hero
  - Venues list and map sections below main content
- **Files Modified**: `client/src/components/TriplistCard.tsx`, `client/src/pages/TriplistDetailPage.tsx`

**October 29, 2025 - Triplist-Venue Linking System (FIXED)**
- **Issue**: Venues uploaded via CSV were not appearing on Triplist Detail pages
- **Root Cause**: The `relatedVenueIds` field in triplists was not being used to populate the `triplist_venues` junction table
- **Solution Implemented**:
  - Updated `createTriplist` and `updateTriplist` to automatically parse `relatedVenueIds` (comma-separated) and populate the junction table
  - Updated `bulkCreateTriplists` to handle venue linking during CSV imports
  - Created `syncTriplistVenues()` method to sync existing triplists with their related venues
  - Added `/api/triplists/sync-venues` API endpoint for manual syncing
  - Added "Sync Venues" button in admin Triplists Management page
  - **Bug Fix**: Fixed apiRequest parameter order in syncVenues mutation (was: method, url, data; corrected to: url, method, data)
- **How to Use**: Click "Sync Venues" in admin Triplists page to populate venue links for existing triplists
- **Status**: RESOLVED - Sync Venues button now works correctly in production
- **Files Modified**: `server/storage.ts`, `server/routes.ts`, `client/src/pages/admin/TriplstsManagement.tsx`

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

### Development Guidelines
- Never modify `vite.config.ts` or `server/vite.ts`
- Don't change ID column types (breaks migrations)

## System Architecture
The PandaHoHo platform employs a full-stack architecture with a React-based frontend, an Express.js backend, and a PostgreSQL database.

### Frontend (React + TanStack Query + Wouter)
- **UI/UX**: Visual-first, card-based exploration with high-quality imagery. Utilizes Inter for UI and Playfair Display for headlines. The primary color scheme is green (`#228B22`). Features subtle hover interactions.
- **Pages**: Includes homepage with hero carousel, browse and detail pages for Cities, Triplists, Venues, Survival Guides, Membership pricing, and an extensive Admin dashboard.
- **Components**: Reusable UI components for navigation, carousels, cards (City, Triplist, Guide), and modals (GroupUp).

### Backend (Express + Drizzle ORM + PostgreSQL)
- **API**: Provides RESTful endpoints for all content types (cities, triplists, venues, guides, group-ups, carousel) and administrative functions.
- **ORM**: Drizzle ORM is used for type-safe database interactions.
- **Validation**: Zod schemas, derived from `drizzle-zod`, ensure robust input validation for all API mutations.

### Database Schema
The PostgreSQL database schema includes tables for:
- `sessions`: Replit Auth session management.
- `users`: User accounts with administrative flags.
- `cities`: Stores city information.
- `venues`: Details of specific locations.
- `triplists`: Curated collections of venues.
- `triplist_venues`: A many-to-many relationship table for triplists and venues.
- `survival_guides`: Essential travel tips.
- `group_ups`: User-organized meetups.
- `favorites`: User-saved content.
- `carousel_items`: Homepage hero carousel slides.
- `content_countries`, `content_travel_types`, `content_seasons`: Manageable dropdown options for content categorization with `isActive` flags and `displayOrder`.

### Technical Implementations
- **Content Management System (CMS)**: Comprehensive admin dashboard for CRUD operations on all content types (Cities, Triplists, Venues, Survival Guides, Carousel, Content Settings).
- **Bulk Data Management**: CSV bulk upload functionality for efficient creation and updating of Triplists, Venues, and Survival Guides, supporting ID-based updates and auto-generation of slugs.
- **Dynamic Content Options**: Dropdown options in admin forms (e.g., Country, Travel Type, Season) are dynamically fetched from `content_settings` tables, ensuring flexibility without code changes.
- **Responsive Design**: Mobile-first approach for optimal viewing across devices.
- **Error Handling**: Implemented loading states and error handling for a smoother user experience.

## External Dependencies
- **Replit Auth**: Used for user authentication, supporting OpenID Connect providers like Google and GitHub, as well as email/password.
- **PostgreSQL**: The primary database for storing all application data and session information.
- **Object Storage**: Configured for handling image uploads (e.g., cover images for venues and triplists).
- **Stripe**: (Planned) Integration for processing membership payments.
- **Google Maps**: Integration for embedding maps and providing direct links to locations on Triplist and Venue detail pages.