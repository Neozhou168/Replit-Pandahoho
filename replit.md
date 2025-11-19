# PandaHoHo - Travel Discovery Platform

## Overview
PandaHoHo is a visual-first travel discovery platform for Chinese cities, replicating www.pandahoho.com. It provides curated content on cities, triplists, venues, and survival guides. The platform includes an admin dashboard for comprehensive content management (CRUD, CSV uploads) and aims to be the leading resource for Chinese city travel. Future ambitions include advanced search, social features, and integrated payments.

## User Preferences
### Design Philosophy
- **Visual-First**: High-quality imagery with gradient overlays
- **Card-Based**: Consistent aspect ratios (4:3) for all content cards
- **Clean Hierarchy**: Clear typography scale with Inter/Playfair Display
- **Subtle Interactions**: Minimal hover effects (scale 1.02, subtle shadows)
- **No Base44 Badges**: User explicitly requested removal of editor integration badges

### Content Management
- Admin dashboard accessible only to users with `isAdmin: true`
- CMS for cities, triplists, venues, survival guides, carousel, content settings, **user management**, **SEO management**
- CSV bulk upload functionality for efficient data management
- **Content Settings** manages simple dropdown vocabularies (Countries, Travel Types, Seasons) - excludes cities
- **Cities Management** (`/admin/cities`): Full CRUD for cities with slug, tagline, imageUrl, and **optional country assignment**
  - Country dropdown populated from Content Settings
  - Country name displayed on each city card when assigned
  - CSV import supports country name (e.g., "China") auto-mapped to countryId
  - countryId is optional (nullable) in both database and schema - cities can exist without country assignment
- **Venues Management** (`/admin/venues`): 
  - **Dynamic Type Dropdown**: Type field now dynamically loads from Content Settings Travel Types instead of hardcoded values
  - Automatically displays all active travel types (Nightlife, Hiking, Attractions, etc.)
  - Supports CSV import with Type field mapping to category column
  - CSV Import uses `emptyToNull()` helper to properly handle empty values as `null`
- Object storage for image uploads (configured, ready for admin integration)
- Sidebar navigation with metric cards
- City name to ID mapping during CSV imports (venues CSV automatically links cities by name)
- Survival Guides admin modal includes Created Date field and Country dropdown (from Content Settings)

### SEO Management System
- **Page-Specific SEO Settings**: Configure SEO metadata for Global Settings, Homepage, Cities Page, Triplists Page, Venues Page, and Survival Guides Page
- **Basic SEO Tab**: Meta title, meta description, keywords (tag-based input)
- **Technical SEO Tab**: Canonical URLs, robots meta tags, structured data (JSON schema markup)
- **Database Schema**: `seo_settings` table with unique constraints ensuring one setting per page type
- **API Routes**: RESTful endpoints at `/api/seo/page/:pageType` for GET/PUT operations
- **Admin UI**: Two-tab interface with page selector dropdown, form validation, and auto-save functionality

### User Management System
- **User Profile Page** (`/profile`): Users can view and edit their name, view email (read-only), view role, upload avatar (prepared for object storage), and see login provider
- **Admin User Management** (`/admin/users`): Administrators can view all users, search by name/email, edit user details (name, role), change user role (member/administrator), and delete users
- **Enhanced User Schema**: Added `authProvider`, `role`, and `lastLoginAt` fields to track authentication source and activity
- **Role-Based Access**: `isAdmin` boolean field is the source of truth for admin status (displays "Administrator" or "Member")
  - Legacy `role` field exists in database but is deprecated and no longer used by frontend
  - All role displays and updates now derive from `isAdmin` boolean to ensure consistency
- **Avatar Upload**: UI prepared for avatar upload with file validation (max 2MB, JPG/PNG/WebP formats)

### Development Guidelines
- Never modify `vite.config.ts` or `server/vite.ts`
- Don't change ID column types (breaks migrations)

## System Architecture
PandaHoHo uses a full-stack architecture with React, Express.js, and PostgreSQL.

### UI/UX
- **Visual-First**: Emphasizes high-quality imagery, card-based layouts, and a clean hierarchy.
- **Color Scheme**: Primary color is green (`#228B22`).
- **Typography**: Inter for UI, Playfair Display for headlines.
- **Interactions**: Subtle hover effects (scale 1.02, subtle shadows).
- **Branding**: Customizable application name, subtitle, and logo via admin interface.
- **Pages**: Homepage with hero carousel, browse/detail pages for Cities, Triplists, Venues, Survival Guides, Membership pricing, and a comprehensive Admin dashboard.
- **Responsive Design**: Mobile-first approach.
- **Triplists Filtering**: Three-row filter system (City, Category, Season) allowing users to filter triplists by location, travel type, and best season to visit.

### Technical Implementations
- **Frontend**: React, TanStack Query, Wouter for routing.
- **Backend**: Express.js for RESTful APIs.
- **Database**: PostgreSQL with Drizzle ORM for type-safe interactions.
- **Validation**: Zod schemas derived from `drizzle-zod` for API input validation.
- **Content Management System (CMS)**: Admin dashboard for CRUD operations across all content types (Cities, Triplists, Venues, Survival Guides, Carousel, Content Settings).
- **Bulk Data Management**: CSV bulk upload for Triplists, Venues, and Survival Guides, supporting ID-based updates and slug auto-generation. Survival Guides CSV uses capitalized column headers (Title, Description, Country, Cover Image URL, Related Video URL, Created Date) with DD/MM/YYYY date format parsing. **CSV Encoding**: Templates download with UTF-8 BOM for proper Chinese character handling. CSV import uses FileReader API with explicit UTF-8 encoding to ensure consistent parsing across dev and production environments, eliminating "0 rows found" issues with Chinese characters.
- **Dynamic Content Options**: Dropdown options (e.g., Country, Travel Type, Season) are fetched from `content_settings` tables.
- **Database Schema**: Tables for `sessions`, `users`, `cities`, `venues`, `triplists`, `triplist_venues` (many-to-many), `survival_guides`, `group_ups`, `favorites`, `carousel_items`, `seo_settings`, and content settings (`content_countries`, `content_travel_types`, `content_seasons`) with `isActive` flags and `displayOrder`. Note: `cities` table contains full city entities (not just dropdown options) managed via `/admin/cities`.
- **Survival Guides**: Support manual creation date setting and country selection from Content Settings. The `country` field (formerly `category`) allows admins to organize guides by destination country.
- **Triplist-Venue Linking**: Automated parsing of `relatedVenueIds` to populate the `triplist_venues` junction table during creation, updates, and bulk imports, with a manual sync option in the admin panel.
- **Performance Optimizations**:
    - **Route-Based Code Splitting**: Using `React.lazy()` for admin and detail pages to reduce initial bundle size.
    - **AuthContext Optimization**: Session tracking to prevent redundant `/api/auth/me` calls.
    - **Image Lazy Loading**: `loading="lazy"` attribute on all card images.
    - **Cloudinary Image Transformations**: `getOptimizedImageUrl()` helper for dynamic image optimization (width constraints, auto-quality, auto-format).
    - **Express Caching Headers**: `Cache-Control` headers for read-only API endpoints to reduce server load and improve subsequent page loads.

### Authentication System
- **Supabase Authentication**: Google OAuth and email/password login.
- **Eager User Sync**: `AuthContext` automatically syncs Supabase users to PostgreSQL database upon sign-in or auth state changes via `/api/auth/me`.
- **Admin Access**: Determined by the `isAdmin` boolean field in the database, which is the source of truth for admin status.
- **Avatar Uploads**: Cloudinary integration for user avatars.
- **JWT Verification**: Backend middleware validates Supabase JWT tokens for protected routes.

## External Dependencies
- **Supabase**: User authentication (Google OAuth, email/password).
- **PostgreSQL**: Primary database (Neon-backed).
- **Cloudinary**: Avatar and image uploads.
- **Object Storage**: For additional image uploads.
- **Stripe**: (Planned) Membership payment processing.
- **Google Maps**: Embedding maps and location linking.