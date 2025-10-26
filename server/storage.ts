// PandaHoHo - Storage Interface & Database Implementation
// ref: blueprint:javascript_log_in_with_replit
import {
  users,
  cities,
  venues,
  triplists,
  triplistVenues,
  survivalGuides,
  groupUps,
  favorites,
  carouselItems,
  type User,
  type UpsertUser,
  type City,
  type InsertCity,
  type Venue,
  type InsertVenue,
  type Triplist,
  type InsertTriplist,
  type SurvivalGuide,
  type InsertSurvivalGuide,
  type GroupUp,
  type InsertGroupUp,
  type CarouselItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // City operations
  getCities(): Promise<City[]>;
  getCity(slug: string): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  updateCity(id: string, city: Partial<InsertCity>): Promise<City | undefined>;
  deleteCity(id: string): Promise<void>;

  // Venue operations
  getVenues(filters?: { triplistId?: string }): Promise<Venue[]>;
  getVenue(slug: string): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: string, venue: Partial<InsertVenue>): Promise<Venue | undefined>;
  deleteVenue(id: string): Promise<void>;

  // Triplist operations
  getTriplists(): Promise<Triplist[]>;
  getTriplist(slug: string): Promise<Triplist | undefined>;
  createTriplist(triplist: InsertTriplist): Promise<Triplist>;
  updateTriplist(id: string, triplist: Partial<InsertTriplist>): Promise<Triplist | undefined>;
  deleteTriplist(id: string): Promise<void>;
  addVenueToTriplist(triplistId: string, venueId: string, order?: number): Promise<void>;

  // Survival Guide operations
  getSurvivalGuides(): Promise<SurvivalGuide[]>;
  getSurvivalGuide(slug: string): Promise<SurvivalGuide | undefined>;
  createSurvivalGuide(guide: InsertSurvivalGuide): Promise<SurvivalGuide>;
  updateSurvivalGuide(id: string, guide: Partial<InsertSurvivalGuide>): Promise<SurvivalGuide | undefined>;
  deleteSurvivalGuide(id: string): Promise<void>;

  // Group-Up operations
  getGroupUps(filters?: { triplistId?: string }): Promise<GroupUp[]>;
  createGroupUp(groupUp: InsertGroupUp): Promise<GroupUp>;

  // Carousel operations
  getCarouselItems(): Promise<CarouselItem[]>;
  createCarouselItem(item: Omit<CarouselItem, "id" | "createdAt">): Promise<CarouselItem>;
  deleteCarouselItem(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ========== User Operations ==========
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // ========== City Operations ==========
  async getCities(): Promise<City[]> {
    return db.select().from(cities).orderBy(cities.name);
  }

  async getCity(slug: string): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.slug, slug));
    return city;
  }

  async createCity(cityData: InsertCity): Promise<City> {
    const [city] = await db.insert(cities).values(cityData).returning();
    return city;
  }

  async updateCity(id: string, cityData: Partial<InsertCity>): Promise<City | undefined> {
    const [city] = await db
      .update(cities)
      .set(cityData)
      .where(eq(cities.id, id))
      .returning();
    return city;
  }

  async deleteCity(id: string): Promise<void> {
    await db.delete(cities).where(eq(cities.id, id));
  }

  // ========== Venue Operations ==========
  async getVenues(filters?: { triplistId?: string }): Promise<Venue[]> {
    if (filters?.triplistId) {
      const result = await db
        .select({ venue: venues })
        .from(triplistVenues)
        .innerJoin(venues, eq(triplistVenues.venueId, venues.id))
        .where(eq(triplistVenues.triplistId, filters.triplistId))
        .orderBy(triplistVenues.order);
      return result.map((r) => r.venue);
    }
    return db.select().from(venues).orderBy(venues.name);
  }

  async getVenue(slug: string): Promise<Venue | undefined> {
    const [venue] = await db.select().from(venues).where(eq(venues.slug, slug));
    return venue;
  }

  async createVenue(venueData: InsertVenue): Promise<Venue> {
    const [venue] = await db.insert(venues).values(venueData).returning();
    return venue;
  }

  async updateVenue(id: string, venueData: Partial<InsertVenue>): Promise<Venue | undefined> {
    const [venue] = await db
      .update(venues)
      .set(venueData)
      .where(eq(venues.id, id))
      .returning();
    return venue;
  }

  async deleteVenue(id: string): Promise<void> {
    await db.delete(venues).where(eq(venues.id, id));
  }

  // ========== Triplist Operations ==========
  async getTriplists(): Promise<Triplist[]> {
    return db.select().from(triplists).orderBy(desc(triplists.createdAt));
  }

  async getTriplist(slug: string): Promise<Triplist | undefined> {
    const [triplist] = await db
      .select()
      .from(triplists)
      .where(eq(triplists.slug, slug));
    return triplist;
  }

  async createTriplist(triplistData: InsertTriplist): Promise<Triplist> {
    const [triplist] = await db.insert(triplists).values(triplistData).returning();
    return triplist;
  }

  async updateTriplist(id: string, triplistData: Partial<InsertTriplist>): Promise<Triplist | undefined> {
    const [triplist] = await db
      .update(triplists)
      .set(triplistData)
      .where(eq(triplists.id, id))
      .returning();
    return triplist;
  }

  async deleteTriplist(id: string): Promise<void> {
    await db.delete(triplists).where(eq(triplists.id, id));
  }

  async addVenueToTriplist(
    triplistId: string,
    venueId: string,
    order: number = 0
  ): Promise<void> {
    await db.insert(triplistVenues).values({
      triplistId,
      venueId,
      order,
    });
  }

  // ========== Survival Guide Operations ==========
  async getSurvivalGuides(): Promise<SurvivalGuide[]> {
    return db.select().from(survivalGuides).orderBy(desc(survivalGuides.createdAt));
  }

  async getSurvivalGuide(slug: string): Promise<SurvivalGuide | undefined> {
    const [guide] = await db
      .select()
      .from(survivalGuides)
      .where(eq(survivalGuides.slug, slug));
    return guide;
  }

  async createSurvivalGuide(guideData: InsertSurvivalGuide): Promise<SurvivalGuide> {
    const [guide] = await db.insert(survivalGuides).values(guideData).returning();
    return guide;
  }

  async updateSurvivalGuide(id: string, guideData: Partial<InsertSurvivalGuide>): Promise<SurvivalGuide | undefined> {
    const [guide] = await db
      .update(survivalGuides)
      .set(guideData)
      .where(eq(survivalGuides.id, id))
      .returning();
    return guide;
  }

  async deleteSurvivalGuide(id: string): Promise<void> {
    await db.delete(survivalGuides).where(eq(survivalGuides.id, id));
  }

  // ========== Group-Up Operations ==========
  async getGroupUps(filters?: { triplistId?: string }): Promise<GroupUp[]> {
    if (filters?.triplistId) {
      return db
        .select()
        .from(groupUps)
        .where(eq(groupUps.triplistId, filters.triplistId))
        .orderBy(groupUps.startTime);
    }
    return db.select().from(groupUps).orderBy(groupUps.startTime);
  }

  async createGroupUp(groupUpData: InsertGroupUp): Promise<GroupUp> {
    const [groupUp] = await db.insert(groupUps).values(groupUpData).returning();
    return groupUp;
  }

  // ========== Carousel Operations ==========
  async getCarouselItems(): Promise<CarouselItem[]> {
    return db
      .select()
      .from(carouselItems)
      .where(eq(carouselItems.isActive, true))
      .orderBy(carouselItems.order);
  }

  async createCarouselItem(
    itemData: Omit<CarouselItem, "id" | "createdAt">
  ): Promise<CarouselItem> {
    const [item] = await db.insert(carouselItems).values(itemData).returning();
    return item;
  }

  async deleteCarouselItem(id: string): Promise<void> {
    await db.delete(carouselItems).where(eq(carouselItems.id, id));
  }
}

export const storage = new DatabaseStorage();
