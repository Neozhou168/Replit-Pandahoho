// PandaHoHo Travel Platform - Complete Data Schema
// Database blueprint integration - ref: javascript_database
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// AUTH TABLES (Replit Auth integration - ref: javascript_log_in_with_replit)
// ============================================================================

// Session storage table - MANDATORY for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - MANDATORY for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================================================
// CORE CONTENT TABLES
// ============================================================================

// Content Settings - Countries
export const content_countries = pgTable("content_countries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentCountrySchema = createInsertSchema(content_countries).omit({
  id: true,
  createdAt: true,
});
export type InsertContentCountry = z.infer<typeof insertContentCountrySchema>;
export type ContentCountry = typeof content_countries.$inferSelect;

// Content Settings - Travel Types
export const content_travel_types = pgTable("content_travel_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentTravelTypeSchema = createInsertSchema(content_travel_types).omit({
  id: true,
  createdAt: true,
});
export type InsertContentTravelType = z.infer<typeof insertContentTravelTypeSchema>;
export type ContentTravelType = typeof content_travel_types.$inferSelect;

// Content Settings - Seasons
export const content_seasons = pgTable("content_seasons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentSeasonSchema = createInsertSchema(content_seasons).omit({
  id: true,
  createdAt: true,
});
export type InsertContentSeason = z.infer<typeof insertContentSeasonSchema>;
export type ContentSeason = typeof content_seasons.$inferSelect;

// Cities - Main destinations
export const cities = pgTable("cities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  tagline: text("tagline").notNull(),
  imageUrl: text("image_url").notNull(),
  triplistCount: integer("triplist_count").default(0),
  countryId: varchar("country_id").references(() => content_countries.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
  createdAt: true,
});
export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

// Venues - Specific locations within cities
export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  cityId: varchar("city_id").references(() => cities.id),
  category: varchar("category", { length: 50 }),
  country: varchar("country", { length: 50 }).default("China"),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  videoUrl: text("video_url"),
  location: text("location").notNull(), // e.g. "Beijing, China"
  highlights: jsonb("highlights").$type<string[]>(), // Array of highlight badges
  proTips: text("pro_tips"), // Formatted text with emoji (Tips section)
  googleMapsEmbedUrl: text("google_maps_embed_url"),
  googleMapsDirectUrl: text("google_maps_direct_url"),
  googleMapsUrl: text("google_maps_url"), // Legacy field, keep for compatibility
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
});
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Venue = typeof venues.$inferSelect;

// Triplists - Curated venue collections
export const triplists = pgTable("triplists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  cityId: varchar("city_id").references(() => cities.id),
  country: varchar("country", { length: 50 }).default("China"),
  category: varchar("category", { length: 50 }), // Hiking, Attractions, etc (Travel Type)
  season: varchar("season", { length: 50 }), // Spring & Autumn, All seasons, etc (Best Season to Travel)
  description: text("description").notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  imageUrl: text("image_url").notNull(),
  videoUrl: text("video_url"),
  googleMapsEmbedUrl: text("google_maps_embed_url"),
  googleMapsDirectUrl: text("google_maps_direct_url"),
  relatedVenueIds: text("related_venue_ids"), // Comma-separated venue IDs
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTriplistSchema = createInsertSchema(triplists).omit({
  id: true,
  createdAt: true,
});
export type InsertTriplist = z.infer<typeof insertTriplistSchema>;
export type Triplist = typeof triplists.$inferSelect;

// Junction table for triplists and venues (many-to-many)
export const triplistVenues = pgTable("triplist_venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  triplistId: varchar("triplist_id")
    .references(() => triplists.id)
    .notNull(),
  venueId: varchar("venue_id")
    .references(() => venues.id)
    .notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Survival Guides
export const survivalGuides = pgTable("survival_guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(), // Full formatted content
  imageUrl: text("image_url").notNull(),
  videoUrl: text("video_url"), // YouTube embed URL
  hasVideo: boolean("has_video").default(false),
  category: varchar("category", { length: 50 }).default("China"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSurvivalGuideSchema = createInsertSchema(survivalGuides).omit({
  id: true,
  createdAt: true,
});
export type InsertSurvivalGuide = z.infer<typeof insertSurvivalGuideSchema>;
export type SurvivalGuide = typeof survivalGuides.$inferSelect;

// Group Ups - User-created meetups
export const groupUps = pgTable("group_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  triplistId: varchar("triplist_id").references(() => triplists.id),
  venueId: varchar("venue_id").references(() => venues.id),
  title: varchar("title", { length: 200 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  meetingPoint: text("meeting_point").notNull(),
  notes: text("notes"),
  participationFee: integer("participation_fee").default(0), // in cents
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGroupUpSchema = createInsertSchema(groupUps).omit({
  id: true,
  createdAt: true,
});
export type InsertGroupUp = z.infer<typeof insertGroupUpSchema>;
export type GroupUp = typeof groupUps.$inferSelect;

// User favorites
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  triplistId: varchar("triplist_id").references(() => triplists.id),
  venueId: varchar("venue_id").references(() => venues.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Homepage carousel items
export const carouselItems = pgTable("carousel_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  subtitle: text("subtitle").notNull(),
  imageUrl: text("image_url").notNull(),
  ctaText: varchar("cta_text", { length: 50 }),
  ctaLink: text("cta_link"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCarouselItemSchema = createInsertSchema(carouselItems).omit({
  id: true,
  createdAt: true,
});
export type InsertCarouselItem = z.infer<typeof insertCarouselItemSchema>;
export type CarouselItem = typeof carouselItems.$inferSelect;

// ============================================================================
// RELATIONS
// ============================================================================

export const citiesRelations = relations(cities, ({ many }) => ({
  triplists: many(triplists),
  venues: many(venues),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  city: one(cities, {
    fields: [venues.cityId],
    references: [cities.id],
  }),
  triplistVenues: many(triplistVenues),
  groupUps: many(groupUps),
}));

export const triplistsRelations = relations(triplists, ({ one, many }) => ({
  city: one(cities, {
    fields: [triplists.cityId],
    references: [cities.id],
  }),
  triplistVenues: many(triplistVenues),
  groupUps: many(groupUps),
}));

export const triplistVenuesRelations = relations(triplistVenues, ({ one }) => ({
  triplist: one(triplists, {
    fields: [triplistVenues.triplistId],
    references: [triplists.id],
  }),
  venue: one(venues, {
    fields: [triplistVenues.venueId],
    references: [venues.id],
  }),
}));

export const groupUpsRelations = relations(groupUps, ({ one }) => ({
  user: one(users, {
    fields: [groupUps.userId],
    references: [users.id],
  }),
  triplist: one(triplists, {
    fields: [groupUps.triplistId],
    references: [triplists.id],
  }),
  venue: one(venues, {
    fields: [groupUps.venueId],
    references: [venues.id],
  }),
}));
