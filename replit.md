# PandaHoHo - Travel Discovery Platform

## Overview
PandaHoHo is a comprehensive travel discovery platform designed to be a complete replica of www.pandahoho.com, focusing on Chinese cities. It aims to provide a rich, visual-first experience for exploring cities, triplists, venues, and survival guides. The platform includes a robust admin dashboard for content management, user authentication, and integrates with essential third-party services. Its core capabilities include showcasing curated travel content, enabling efficient content management through CRUD operations and bulk CSV uploads, and offering a dynamic, responsive user interface. The project envisions becoming the go-to platform for discovering travel experiences in Chinese cities, with future plans for advanced search, social features, and integrated payment solutions.

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