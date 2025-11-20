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
  branding,
  content_countries,
  content_travel_types,
  content_seasons,
  hashtags,
  triplistHashtags,
  pageViews,
  seoSettings,
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
  type Branding,
  type InsertBranding,
  type ContentCountry,
  type InsertContentCountry,
  type ContentTravelType,
  type InsertContentTravelType,
  type ContentSeason,
  type InsertContentSeason,
  type Hashtag,
  type InsertHashtag,
  type TriplistHashtag,
  type InsertTriplistHashtag,
  type PageView,
  type InsertPageView,
  type SeoSettings,
  type InsertSeoSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, inArray, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  // City operations
  getCities(): Promise<City[]>;
  getCity(slug: string): Promise<City | undefined>;
  getCitiesByIds(cityIds: string[]): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;
  updateCity(id: string, city: Partial<InsertCity>): Promise<City | undefined>;
  deleteCity(id: string): Promise<void>;
  bulkCreateCities(cities: InsertCity[]): Promise<City[]>;

  // Venue operations
  getVenues(filters?: { triplistId?: string }): Promise<Venue[]>;
  getVenue(slug: string): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: string, venue: Partial<InsertVenue>): Promise<Venue | undefined>;
  deleteVenue(id: string): Promise<void>;
  bulkCreateVenues(venues: InsertVenue[]): Promise<{ venues: Venue[]; created: number; updated: number }>;

  // Triplist operations
  getTriplists(): Promise<Triplist[]>;
  getTriplist(slug: string): Promise<Triplist | undefined>;
  createTriplist(triplist: InsertTriplist): Promise<Triplist>;
  updateTriplist(id: string, triplist: Partial<InsertTriplist>): Promise<Triplist | undefined>;
  deleteTriplist(id: string): Promise<void>;
  deleteAllTriplists(): Promise<{ deleted: number }>;
  addVenueToTriplist(triplistId: string, venueId: string, order?: number): Promise<void>;
  bulkCreateTriplists(triplists: InsertTriplist[]): Promise<Triplist[]>;
  syncTriplistVenues(): Promise<{ synced: number; errors: string[] }>;

  // Survival Guide operations
  getSurvivalGuides(): Promise<SurvivalGuide[]>;
  getSurvivalGuide(slug: string): Promise<SurvivalGuide | undefined>;
  createSurvivalGuide(guide: InsertSurvivalGuide): Promise<SurvivalGuide>;
  updateSurvivalGuide(id: string, guide: Partial<InsertSurvivalGuide>): Promise<SurvivalGuide | undefined>;
  deleteSurvivalGuide(id: string): Promise<void>;
  bulkCreateSurvivalGuides(guides: InsertSurvivalGuide[]): Promise<SurvivalGuide[]>;

  // Group-Up operations
  getGroupUps(filters?: { triplistId?: string }): Promise<GroupUp[]>;
  createGroupUp(groupUp: InsertGroupUp): Promise<GroupUp>;

  // Carousel operations
  getCarouselItems(): Promise<CarouselItem[]>;
  createCarouselItem(item: Omit<CarouselItem, "id" | "createdAt">): Promise<CarouselItem>;
  updateCarouselItem(id: string, item: Partial<Omit<CarouselItem, "id" | "createdAt">>): Promise<CarouselItem | undefined>;
  deleteCarouselItem(id: string): Promise<void>;
  bulkCreateCarouselItems(items: Omit<CarouselItem, "id" | "createdAt">[]): Promise<CarouselItem[]>;

  // Content Settings - Countries
  getContentCountries(): Promise<ContentCountry[]>;
  createContentCountry(country: InsertContentCountry): Promise<ContentCountry>;
  updateContentCountry(id: string, country: Partial<InsertContentCountry>): Promise<ContentCountry | undefined>;
  deleteContentCountry(id: string): Promise<void>;

  // Content Settings - Travel Types
  getContentTravelTypes(): Promise<ContentTravelType[]>;
  createContentTravelType(travelType: InsertContentTravelType): Promise<ContentTravelType>;
  updateContentTravelType(id: string, travelType: Partial<InsertContentTravelType>): Promise<ContentTravelType | undefined>;
  deleteContentTravelType(id: string): Promise<void>;
  updateContentTravelTypeOrder(id: string, newOrder: number): Promise<void>;

  // Content Settings - Seasons
  getContentSeasons(): Promise<ContentSeason[]>;
  createContentSeason(season: InsertContentSeason): Promise<ContentSeason>;
  updateContentSeason(id: string, season: Partial<InsertContentSeason>): Promise<ContentSeason | undefined>;
  deleteContentSeason(id: string): Promise<void>;
  updateContentSeasonOrder(id: string, newOrder: number): Promise<void>;

  // Hashtag operations
  getHashtags(promotedOnly?: boolean): Promise<Hashtag[]>;
  getHashtag(id: string): Promise<Hashtag | undefined>;
  createHashtag(hashtag: InsertHashtag): Promise<Hashtag>;
  updateHashtag(id: string, hashtag: Partial<InsertHashtag>): Promise<Hashtag | undefined>;
  deleteHashtag(id: string): Promise<void>;
  updateHashtagOrder(id: string, newOrder: number): Promise<void>;
  getTriplistHashtags(triplistId: string): Promise<(TriplistHashtag & { hashtag: Hashtag })[]>;
  setTriplistHashtags(triplistId: string, hashtagIds: string[]): Promise<void>;
  getTriplistsHashtagsBatch(triplistIds: string[]): Promise<Map<string, Hashtag[]>>;

  // Branding operations
  getBranding(): Promise<Branding>;
  updateBranding(data: Partial<InsertBranding>): Promise<Branding>;

  // Analytics operations
  trackPageView(pageView: InsertPageView): Promise<PageView>;

  // SEO Settings operations
  getSeoSettings(pageType: string, pageIdentifier?: string): Promise<SeoSettings | undefined>;
  getAllSeoSettings(): Promise<SeoSettings[]>;
  upsertSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings>;
  updateSeoSettings(id: string, settings: Partial<InsertSeoSettings>): Promise<SeoSettings | undefined>;
  deleteSeoSettings(id: string): Promise<void>;
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

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // ========== City Operations ==========
  async getCities(): Promise<City[]> {
    // Get cities with dynamic triplist counts using raw SQL to ensure production compatibility
    const citiesWithCounts = await db.execute<City>(sql`
      SELECT 
        cities.id,
        cities.name,
        cities.slug,
        cities.tagline,
        cities.image_url as "imageUrl",
        cities.country_id as "countryId",
        cities.is_active as "isActive",
        cities.created_at as "createdAt",
        CAST(COUNT(triplists.id) AS INTEGER) as "triplistCount"
      FROM cities
      LEFT JOIN triplists ON cities.id = triplists.city_id
      GROUP BY cities.id, cities.name, cities.slug, cities.tagline, cities.image_url, cities.country_id, cities.is_active, cities.created_at
      ORDER BY cities.name
    `);
    
    return citiesWithCounts.rows as City[];
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

  async bulkCreateCities(citiesData: InsertCity[]): Promise<City[]> {
    if (citiesData.length === 0) return [];
    return db.insert(cities).values(citiesData).returning();
  }

  async getCitiesByIds(cityIds: string[]): Promise<City[]> {
    if (cityIds.length === 0) return [];
    return db.select().from(cities).where(inArray(cities.id, cityIds));
  }

  // ========== Venue Operations ==========
  async getVenues(filters?: { triplistId?: string }): Promise<Venue[]> {
    if (filters?.triplistId) {
      // First try the junction table
      const result = await db
        .select({ venue: venues })
        .from(triplistVenues)
        .innerJoin(venues, eq(triplistVenues.venueId, venues.id))
        .where(eq(triplistVenues.triplistId, filters.triplistId))
        .orderBy(triplistVenues.order);
      
      // If junction table has results, return them
      if (result.length > 0) {
        return result.map((r) => r.venue);
      }
      
      // Fallback: read from triplist's related_venue_ids field
      const [triplist] = await db
        .select()
        .from(triplists)
        .where(eq(triplists.id, filters.triplistId));
      
      if (triplist && triplist.relatedVenueIds && triplist.relatedVenueIds.trim()) {
        // Parse the venue IDs from the semicolon/comma-separated field
        const venueIds = triplist.relatedVenueIds
          .split(/[,;]/)
          .map(id => id.trim())
          .filter(id => id.length > 0);
        
        if (venueIds.length > 0) {
          // Fetch venues by IDs
          const venuesResult = await db
            .select()
            .from(venues)
            .where(inArray(venues.id, venueIds));
          
          // Sort venues in the same order as they appear in related_venue_ids
          const venueMap = new Map(venuesResult.map(v => [v.id, v]));
          return venueIds
            .map(id => venueMap.get(id))
            .filter((v): v is Venue => v !== undefined);
        }
      }
      
      return [];
    }
    return db.select().from(venues).orderBy(venues.name);
  }

  async getVenue(slug: string): Promise<Venue | undefined> {
    const [venue] = await db.select().from(venues).where(eq(venues.slug, slug));
    return venue;
  }

  async createVenue(venueData: InsertVenue): Promise<Venue> {
    const [venue] = await db.insert(venues).values(venueData as any).returning();
    return venue;
  }

  async updateVenue(id: string, venueData: Partial<InsertVenue>): Promise<Venue | undefined> {
    const [venue] = await db
      .update(venues)
      .set(venueData as any)
      .where(eq(venues.id, id))
      .returning();
    return venue;
  }

  async deleteVenue(id: string): Promise<void> {
    // Delete related records first to avoid foreign key constraint errors
    await db.delete(favorites).where(eq(favorites.venueId, id));
    await db.delete(triplistVenues).where(eq(triplistVenues.venueId, id));
    await db.delete(groupUps).where(eq(groupUps.venueId, id));
    
    // Now delete the venue itself
    await db.delete(venues).where(eq(venues.id, id));
  }

  async bulkCreateVenues(venuesData: InsertVenue[]): Promise<{ venues: Venue[]; created: number; updated: number }> {
    if (venuesData.length === 0) return { venues: [], created: 0, updated: 0 };
    
    // Upsert logic: match by name to avoid duplicates
    const allExistingVenues = await db.select().from(venues);
    const existingByName = new Map(
      allExistingVenues.map(v => [v.name.toLowerCase(), v])
    );
    const existingById = new Map(allExistingVenues.map(v => [v.id, v]));
    
    const results: Venue[] = [];
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const venueData of venuesData) {
      const csvId = venueData.id;
      const existingByThisName = existingByName.get(venueData.name.toLowerCase());
      const existingByThisId = csvId ? existingById.get(csvId) : undefined;
      
      if (existingByThisId) {
        // CSV ID exists in DB - just update with CSV data (excluding id)
        const { id: _omittedId, ...updateData } = venueData;
        const [updated] = await db
          .update(venues)
          .set(updateData as any)
          .where(eq(venues.id, csvId!))
          .returning();
        results.push(updated);
        updatedCount++;
      } else if (existingByThisName && csvId && existingByThisName.id !== csvId) {
        // Name matches but different ID - need to replace with new ID (count as update)
        await db.transaction(async (tx) => {
          // Step 1: Temporarily rename old record's slug to avoid conflict
          await tx
            .update(venues)
            .set({ slug: `${existingByThisName.slug}_old_${Date.now()}` })
            .where(eq(venues.id, existingByThisName.id));
          
          // Step 2: Insert new record with CSV ID
          await tx.insert(venues).values(venueData as any);
          
          // Step 3: Update all FK references from old ID to new ID
          await tx
            .update(triplistVenues)
            .set({ venueId: csvId })
            .where(eq(triplistVenues.venueId, existingByThisName.id));
          
          await tx
            .update(groupUps)
            .set({ venueId: csvId })
            .where(eq(groupUps.venueId, existingByThisName.id));
          
          // Step 4: Delete old record
          await tx.delete(venues).where(eq(venues.id, existingByThisName.id));
        });
        
        const [newVenue] = await db.select().from(venues).where(eq(venues.id, csvId));
        results.push(newVenue);
        updatedCount++;  // This is an update (replacing existing venue with new ID)
      } else if (existingByThisName) {
        // Name matches, no ID conflict - just update (excluding id)
        const { id: _omittedId2, ...updateData } = venueData;
        const [updated] = await db
          .update(venues)
          .set(updateData as any)
          .where(eq(venues.id, existingByThisName.id))
          .returning();
        results.push(updated);
        updatedCount++;
      } else {
        // New venue - insert
        const [venue] = await db.insert(venues).values(venueData as any).returning();
        results.push(venue);
        createdCount++;
      }
    }
    
    return { venues: results, created: createdCount, updated: updatedCount };
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
    // Extract hashtagIds before inserting (it's not a real column)
    const { hashtagIds, ...dataToInsert } = triplistData;
    
    const [triplist] = await db.insert(triplists).values(dataToInsert).returning();
    
    // If hashtagIds is provided, populate the junction table
    if (hashtagIds && Array.isArray(hashtagIds) && hashtagIds.length > 0) {
      await this.setTriplistHashtags(triplist.id, hashtagIds);
    }
    
    // If relatedVenueIds is provided, populate the junction table
    if (triplistData.relatedVenueIds && triplistData.relatedVenueIds.trim()) {
      const venueIds = triplistData.relatedVenueIds
        .split(/[,;]/)
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      for (let i = 0; i < venueIds.length; i++) {
        try {
          await this.addVenueToTriplist(triplist.id, venueIds[i], i);
        } catch (error) {
          // Log the error but continue with other venues
          console.warn(`Failed to add venue ${venueIds[i]} to triplist ${triplist.id}:`, error);
        }
      }
    }
    
    return triplist;
  }

  async updateTriplist(id: string, triplistData: Partial<InsertTriplist>): Promise<Triplist | undefined> {
    // Extract hashtagIds before updating (it's not a real column)
    const { hashtagIds, ...dataToUpdate } = triplistData;
    
    const [triplist] = await db
      .update(triplists)
      .set(dataToUpdate)
      .where(eq(triplists.id, id))
      .returning();
    
    // If hashtagIds is being updated, re-sync the junction table
    if (hashtagIds !== undefined) {
      if (Array.isArray(hashtagIds) && hashtagIds.length > 0) {
        await this.setTriplistHashtags(id, hashtagIds);
      } else {
        // Clear hashtags if empty array provided
        await this.setTriplistHashtags(id, []);
      }
    }
    
    // If relatedVenueIds is being updated, re-sync the junction table
    if (triplistData.relatedVenueIds !== undefined) {
      // First, clear existing venue links for this triplist
      await db.delete(triplistVenues).where(eq(triplistVenues.triplistId, id));
      
      // Then add new links if provided
      if (triplistData.relatedVenueIds && triplistData.relatedVenueIds.trim()) {
        const venueIds = triplistData.relatedVenueIds
          .split(/[,;]/)
          .map(vid => vid.trim())
          .filter(vid => vid.length > 0);
        
        for (let i = 0; i < venueIds.length; i++) {
          try {
            await this.addVenueToTriplist(id, venueIds[i], i);
          } catch (error) {
            // Log the error but continue with other venues
            console.warn(`Failed to add venue ${venueIds[i]} to triplist ${id}:`, error);
          }
        }
      }
    }
    
    return triplist;
  }

  async deleteTriplist(id: string): Promise<void> {
    // Delete related records first to avoid FK constraint violations
    await db.delete(favorites).where(eq(favorites.triplistId, id));
    await db.delete(triplistVenues).where(eq(triplistVenues.triplistId, id));
    await db.delete(groupUps).where(eq(groupUps.triplistId, id));
    await db.delete(triplists).where(eq(triplists.id, id));
  }

  async deleteAllTriplists(): Promise<{ deleted: number }> {
    // Get count before deleting
    const allTriplists = await db.select().from(triplists);
    const count = allTriplists.length;
    
    // Delete all related records first
    await db.delete(favorites).where(sql`triplist_id IS NOT NULL`);
    await db.delete(triplistVenues);
    await db.delete(groupUps);
    await db.delete(triplists);
    
    return { deleted: count };
  }

  async bulkCreateTriplists(triplistsData: InsertTriplist[]): Promise<Triplist[]> {
    if (triplistsData.length === 0) return [];
    
    // Upsert logic: match by title to avoid duplicates
    const allExistingTriplists = await db.select().from(triplists);
    const existingByTitle = new Map(
      allExistingTriplists.map(t => [t.title.toLowerCase(), t])
    );
    const existingById = new Map(allExistingTriplists.map(t => [t.id, t]));
    
    const results: Triplist[] = [];
    
    for (const triplistData of triplistsData) {
      const csvId = triplistData.id;
      const existingByThisTitle = existingByTitle.get(triplistData.title.toLowerCase());
      const existingByThisId = csvId ? existingById.get(csvId) : undefined;
      
      if (existingByThisId) {
        // CSV ID exists in DB - update with CSV data (excluding id)
        const { id, ...updateData } = triplistData;
        const [triplist] = await db
          .update(triplists)
          .set(updateData)
          .where(eq(triplists.id, csvId!))
          .returning();
        
        // Re-sync junction table
        if (triplistData.relatedVenueIds !== undefined) {
          await db.delete(triplistVenues).where(eq(triplistVenues.triplistId, csvId!));
          if (triplistData.relatedVenueIds && triplistData.relatedVenueIds.trim()) {
            const venueIds = triplistData.relatedVenueIds
              .split(/[,;]/)
              .map(id => id.trim())
              .filter(id => id.length > 0);
            for (let i = 0; i < venueIds.length; i++) {
              try {
                await this.addVenueToTriplist(csvId!, venueIds[i], i);
              } catch (error) {
                console.warn(`Failed to add venue ${venueIds[i]} to triplist ${csvId}:`, error);
              }
            }
          }
        }
        
        results.push(triplist);
      } else if (existingByThisTitle && csvId && existingByThisTitle.id !== csvId) {
        // Title matches but different ID - need to replace with new ID
        await db.transaction(async (tx) => {
          // Step 1: Temporarily rename old record's slug to avoid conflict
          await tx
            .update(triplists)
            .set({ slug: `${existingByThisTitle.slug}_old_${Date.now()}` })
            .where(eq(triplists.id, existingByThisTitle.id));
          
          // Step 2: Insert new record with CSV ID
          await tx.insert(triplists).values(triplistData);
          
          // Step 3: Update all FK references from old ID to new ID
          await tx
            .update(groupUps)
            .set({ triplistId: csvId })
            .where(eq(groupUps.triplistId, existingByThisTitle.id));
          
          // Step 4: Re-sync triplistVenues junction table
          await tx.delete(triplistVenues).where(eq(triplistVenues.triplistId, existingByThisTitle.id));
          if (triplistData.relatedVenueIds && triplistData.relatedVenueIds.trim()) {
            const venueIds = triplistData.relatedVenueIds
              .split(/[,;]/)
              .map(id => id.trim())
              .filter(id => id.length > 0);
            for (let i = 0; i < venueIds.length; i++) {
              await tx.insert(triplistVenues).values({
                triplistId: csvId,
                venueId: venueIds[i],
                order: i,
              });
            }
          }
          
          // Step 5: Delete old record
          await tx.delete(triplists).where(eq(triplists.id, existingByThisTitle.id));
        });
        
        const [newTriplist] = await db.select().from(triplists).where(eq(triplists.id, csvId));
        results.push(newTriplist);
      } else if (existingByThisTitle) {
        // Title matches, no ID conflict - just update (excluding id)
        const { id, ...updateData } = triplistData;
        const [triplist] = await db
          .update(triplists)
          .set(updateData)
          .where(eq(triplists.id, existingByThisTitle.id))
          .returning();
        
        // Re-sync junction table
        if (triplistData.relatedVenueIds !== undefined) {
          await db.delete(triplistVenues).where(eq(triplistVenues.triplistId, existingByThisTitle.id));
          if (triplistData.relatedVenueIds && triplistData.relatedVenueIds.trim()) {
            const venueIds = triplistData.relatedVenueIds
              .split(/[,;]/)
              .map(id => id.trim())
              .filter(id => id.length > 0);
            for (let i = 0; i < venueIds.length; i++) {
              try {
                await this.addVenueToTriplist(existingByThisTitle.id, venueIds[i], i);
              } catch (error) {
                console.warn(`Failed to add venue ${venueIds[i]} to triplist ${existingByThisTitle.id}:`, error);
              }
            }
          }
        }
        
        results.push(triplist);
      } else {
        // New triplist - insert
        const [triplist] = await db.insert(triplists).values(triplistData).returning();
        
        // Populate junction table
        if (triplistData.relatedVenueIds && triplistData.relatedVenueIds.trim()) {
          const venueIds = triplistData.relatedVenueIds
            .split(/[,;]/)
            .map(id => id.trim())
            .filter(id => id.length > 0);
          for (let i = 0; i < venueIds.length; i++) {
            try {
              await this.addVenueToTriplist(triplist.id, venueIds[i], i);
            } catch (error) {
              console.warn(`Failed to add venue ${venueIds[i]} to triplist ${triplist.id}:`, error);
            }
          }
        }
        
        results.push(triplist);
      }
    }
    
    return results;
  }

  async addVenueToTriplist(
    triplistId: string,
    venueId: string,
    order: number = 0
  ): Promise<void> {
    // Check if venue exists before adding
    const [venue] = await db.select().from(venues).where(eq(venues.id, venueId));
    if (!venue) {
      throw new Error(`Venue with ID ${venueId} does not exist`);
    }
    
    // Check if this relationship already exists
    const [existing] = await db
      .select()
      .from(triplistVenues)
      .where(
        and(
          eq(triplistVenues.triplistId, triplistId),
          eq(triplistVenues.venueId, venueId)
        )
      );
    
    if (existing) {
      // Update the order if it already exists
      await db
        .update(triplistVenues)
        .set({ order })
        .where(
          and(
            eq(triplistVenues.triplistId, triplistId),
            eq(triplistVenues.venueId, venueId)
          )
        );
    } else {
      // Insert new relationship
      await db.insert(triplistVenues).values({
        triplistId,
        venueId,
        order,
      });
    }
  }

  async syncTriplistVenues(): Promise<{ synced: number; errors: string[] }> {
    const allTriplists = await db.select().from(triplists);
    let syncedCount = 0;
    const errors: string[] = [];

    for (const triplist of allTriplists) {
      if (triplist.relatedVenueIds && triplist.relatedVenueIds.trim()) {
        try {
          // Clear existing links for this triplist
          await db.delete(triplistVenues).where(eq(triplistVenues.triplistId, triplist.id));
          
          // Add new links from relatedVenueIds
          const venueIds = triplist.relatedVenueIds
            .split(/[,;]/)
            .map(id => id.trim())
            .filter(id => id.length > 0);
          
          let successCount = 0;
          const venueErrors: string[] = [];
          
          for (let i = 0; i < venueIds.length; i++) {
            try {
              await this.addVenueToTriplist(triplist.id, venueIds[i], i);
              successCount++;
            } catch (error) {
              venueErrors.push(`Venue ${venueIds[i]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
          
          if (venueErrors.length > 0) {
            errors.push(`Triplist "${triplist.title}" - ${successCount}/${venueIds.length} venues synced. Errors: ${venueErrors.join('; ')}`);
          }
          
          syncedCount++;
        } catch (error) {
          errors.push(`Failed to sync triplist "${triplist.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return { synced: syncedCount, errors };
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

  async bulkCreateSurvivalGuides(guidesData: InsertSurvivalGuide[]): Promise<SurvivalGuide[]> {
    if (guidesData.length === 0) return [];
    return db.insert(survivalGuides).values(guidesData).returning();
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

  async updateCarouselItem(
    id: string,
    itemData: Partial<Omit<CarouselItem, "id" | "createdAt">>
  ): Promise<CarouselItem | undefined> {
    const [item] = await db
      .update(carouselItems)
      .set(itemData)
      .where(eq(carouselItems.id, id))
      .returning();
    return item;
  }

  async deleteCarouselItem(id: string): Promise<void> {
    await db.delete(carouselItems).where(eq(carouselItems.id, id));
  }

  async bulkCreateCarouselItems(itemsData: Omit<CarouselItem, "id" | "createdAt">[]): Promise<CarouselItem[]> {
    if (itemsData.length === 0) return [];
    return db.insert(carouselItems).values(itemsData).returning();
  }

  // ========== Content Settings - Countries ==========
  async getContentCountries(): Promise<ContentCountry[]> {
    return db.select().from(content_countries).orderBy(content_countries.name);
  }

  async createContentCountry(countryData: InsertContentCountry): Promise<ContentCountry> {
    const [country] = await db.insert(content_countries).values(countryData).returning();
    return country;
  }

  async updateContentCountry(id: string, countryData: Partial<InsertContentCountry>): Promise<ContentCountry | undefined> {
    const [country] = await db
      .update(content_countries)
      .set(countryData)
      .where(eq(content_countries.id, id))
      .returning();
    return country;
  }

  async deleteContentCountry(id: string): Promise<void> {
    await db.delete(content_countries).where(eq(content_countries.id, id));
  }

  // ========== Content Settings - Travel Types ==========
  async getContentTravelTypes(): Promise<ContentTravelType[]> {
    return db.select().from(content_travel_types).orderBy(content_travel_types.displayOrder);
  }

  async createContentTravelType(travelTypeData: InsertContentTravelType): Promise<ContentTravelType> {
    const [travelType] = await db.insert(content_travel_types).values(travelTypeData).returning();
    return travelType;
  }

  async updateContentTravelType(id: string, travelTypeData: Partial<InsertContentTravelType>): Promise<ContentTravelType | undefined> {
    const [travelType] = await db
      .update(content_travel_types)
      .set(travelTypeData)
      .where(eq(content_travel_types.id, id))
      .returning();
    return travelType;
  }

  async deleteContentTravelType(id: string): Promise<void> {
    await db.delete(content_travel_types).where(eq(content_travel_types.id, id));
  }

  async updateContentTravelTypeOrder(id: string, newOrder: number): Promise<void> {
    await db
      .update(content_travel_types)
      .set({ displayOrder: newOrder })
      .where(eq(content_travel_types.id, id));
  }

  // ========== Content Settings - Seasons ==========
  async getContentSeasons(): Promise<ContentSeason[]> {
    return db.select().from(content_seasons).orderBy(content_seasons.displayOrder);
  }

  async createContentSeason(seasonData: InsertContentSeason): Promise<ContentSeason> {
    const [season] = await db.insert(content_seasons).values(seasonData).returning();
    return season;
  }

  async updateContentSeason(id: string, seasonData: Partial<InsertContentSeason>): Promise<ContentSeason | undefined> {
    const [season] = await db
      .update(content_seasons)
      .set(seasonData)
      .where(eq(content_seasons.id, id))
      .returning();
    return season;
  }

  async deleteContentSeason(id: string): Promise<void> {
    await db.delete(content_seasons).where(eq(content_seasons.id, id));
  }

  async updateContentSeasonOrder(id: string, newOrder: number): Promise<void> {
    await db
      .update(content_seasons)
      .set({ displayOrder: newOrder })
      .where(eq(content_seasons.id, id));
  }

  // ========== Hashtag Operations ==========
  async getHashtags(promotedOnly?: boolean): Promise<Hashtag[]> {
    const query = db.select().from(hashtags);
    
    if (promotedOnly) {
      return query.where(
        and(
          eq(hashtags.isPromoted, true),
          eq(hashtags.isActive, true)
        )
      ).orderBy(hashtags.displayOrder, hashtags.name);
    }
    
    return query
      .where(eq(hashtags.isActive, true))
      .orderBy(hashtags.displayOrder, hashtags.name);
  }

  async getHashtag(id: string): Promise<Hashtag | undefined> {
    const [hashtag] = await db.select().from(hashtags).where(eq(hashtags.id, id));
    return hashtag;
  }

  async createHashtag(hashtagData: InsertHashtag): Promise<Hashtag> {
    const [hashtag] = await db.insert(hashtags).values(hashtagData).returning();
    return hashtag;
  }

  async updateHashtag(id: string, hashtagData: Partial<InsertHashtag>): Promise<Hashtag | undefined> {
    const [hashtag] = await db
      .update(hashtags)
      .set(hashtagData)
      .where(eq(hashtags.id, id))
      .returning();
    return hashtag;
  }

  async deleteHashtag(id: string): Promise<void> {
    try {
      // First delete all triplist-hashtag associations
      const deletedAssociations = await db
        .delete(triplistHashtags)
        .where(eq(triplistHashtags.hashtagId, id))
        .returning();
      console.log(`[deleteHashtag] Deleted ${deletedAssociations.length} associations for hashtag ${id}`);
      
      // Then delete the hashtag
      const deletedHashtag = await db
        .delete(hashtags)
        .where(eq(hashtags.id, id))
        .returning();
      console.log(`[deleteHashtag] Deleted hashtag:`, deletedHashtag.length > 0 ? deletedHashtag[0] : 'Not found');
      
      if (deletedHashtag.length === 0) {
        throw new Error(`Hashtag ${id} not found`);
      }
    } catch (error) {
      console.error(`[deleteHashtag] Error deleting hashtag ${id}:`, error);
      throw error;
    }
  }

  async updateHashtagOrder(id: string, newOrder: number): Promise<void> {
    await db
      .update(hashtags)
      .set({ displayOrder: newOrder })
      .where(eq(hashtags.id, id));
  }

  async getTriplistHashtags(triplistId: string): Promise<(TriplistHashtag & { hashtag: Hashtag })[]> {
    const results = await db
      .select({
        id: triplistHashtags.id,
        triplistId: triplistHashtags.triplistId,
        hashtagId: triplistHashtags.hashtagId,
        order: triplistHashtags.order,
        createdAt: triplistHashtags.createdAt,
        hashtag: hashtags,
      })
      .from(triplistHashtags)
      .innerJoin(hashtags, eq(triplistHashtags.hashtagId, hashtags.id))
      .where(eq(triplistHashtags.triplistId, triplistId))
      .orderBy(triplistHashtags.order, hashtags.name);
    
    return results;
  }

  async setTriplistHashtags(triplistId: string, hashtagIds: string[]): Promise<void> {
    // Delete existing hashtag associations
    await db.delete(triplistHashtags).where(eq(triplistHashtags.triplistId, triplistId));
    
    // Insert new associations
    if (hashtagIds.length > 0) {
      await db.insert(triplistHashtags).values(
        hashtagIds.map((hashtagId, index) => ({
          triplistId,
          hashtagId,
          order: index,
        }))
      );
    }
  }

  async getTriplistsHashtagsBatch(triplistIds: string[]): Promise<Map<string, Hashtag[]>> {
    if (triplistIds.length === 0) {
      return new Map();
    }

    // Fetch all hashtags for all triplists in a single query
    const results = await db
      .select({
        triplistId: triplistHashtags.triplistId,
        hashtag: hashtags,
        order: triplistHashtags.order,
      })
      .from(triplistHashtags)
      .innerJoin(hashtags, eq(triplistHashtags.hashtagId, hashtags.id))
      .where(inArray(triplistHashtags.triplistId, triplistIds))
      .orderBy(triplistHashtags.order, hashtags.name);
    
    // Group hashtags by triplistId
    const hashtagsMap = new Map<string, Hashtag[]>();
    for (const result of results) {
      const existing = hashtagsMap.get(result.triplistId) || [];
      existing.push(result.hashtag);
      hashtagsMap.set(result.triplistId, existing);
    }
    
    return hashtagsMap;
  }

  // ========== Branding Operations ==========
  async getBranding(): Promise<Branding> {
    const [brandingRow] = await db.select().from(branding).limit(1);
    
    // If no branding exists, create default one
    if (!brandingRow) {
      const [newBranding] = await db
        .insert(branding)
        .values({
          appName: "PandaHoHo",
          appSubtitle: "Independent Travel Assistant",
          logoUrl: null,
        })
        .returning();
      return newBranding;
    }
    
    return brandingRow;
  }

  async updateBranding(data: Partial<InsertBranding>): Promise<Branding> {
    // Get existing branding or create if doesn't exist
    const existing = await this.getBranding();
    
    const [updated] = await db
      .update(branding)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(branding.id, existing.id))
      .returning();
    
    return updated;
  }

  // ========== Analytics Operations ==========
  async trackPageView(pageViewData: InsertPageView): Promise<PageView> {
    const [pageView] = await db
      .insert(pageViews)
      .values(pageViewData)
      .returning();
    return pageView;
  }

  // ========== SEO Settings Operations ==========
  // Helper to normalize page identifiers (empty string → undefined)
  private normalizePageIdentifier(identifier: string | null | undefined): string | undefined {
    if (!identifier || identifier.trim() === '') {
      return undefined;
    }
    return identifier.trim();
  }

  async getSeoSettings(pageType: string, pageIdentifier?: string): Promise<SeoSettings | undefined> {
    const normalizedIdentifier = this.normalizePageIdentifier(pageIdentifier);
    
    const conditions = normalizedIdentifier
      ? and(eq(seoSettings.pageType, pageType), eq(seoSettings.pageIdentifier, normalizedIdentifier))
      : and(eq(seoSettings.pageType, pageType), isNull(seoSettings.pageIdentifier));
    
    const [settings] = await db.select().from(seoSettings).where(conditions);
    return settings;
  }

  async getAllSeoSettings(): Promise<SeoSettings[]> {
    return db.select().from(seoSettings).orderBy(seoSettings.pageType);
  }

  async upsertSeoSettings(settingsData: InsertSeoSettings): Promise<SeoSettings> {
    // Normalize the page identifier (empty string → undefined/null)
    const normalizedData = {
      ...settingsData,
      pageIdentifier: this.normalizePageIdentifier(settingsData.pageIdentifier) || null,
    };

    // Check if settings already exist for this page type and identifier
    const existing = await this.getSeoSettings(
      normalizedData.pageType, 
      normalizedData.pageIdentifier ?? undefined
    );
    
    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(seoSettings)
        .set({
          ...normalizedData,
          updatedAt: new Date(),
        })
        .where(eq(seoSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      try {
        const [created] = await db
          .insert(seoSettings)
          .values(normalizedData)
          .returning();
        return created;
      } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505') { // PostgreSQL unique violation code
          throw new Error(`SEO settings already exist for pageType "${normalizedData.pageType}" with identifier "${normalizedData.pageIdentifier || 'global'}"`);
        }
        throw error;
      }
    }
  }

  async updateSeoSettings(id: string, settingsData: Partial<InsertSeoSettings>): Promise<SeoSettings | undefined> {
    // Normalize the page identifier if provided
    const normalizedData = {
      ...settingsData,
      ...(settingsData.pageIdentifier !== undefined && {
        pageIdentifier: this.normalizePageIdentifier(settingsData.pageIdentifier) || null,
      }),
    };

    try {
      const [updated] = await db
        .update(seoSettings)
        .set({
          ...normalizedData,
          updatedAt: new Date(),
        })
        .where(eq(seoSettings.id, id))
        .returning();
      return updated;
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        throw new Error(`Cannot update: SEO settings with this pageType and identifier combination already exist`);
      }
      throw error;
    }
  }

  async deleteSeoSettings(id: string): Promise<void> {
    await db.delete(seoSettings).where(eq(seoSettings.id, id));
  }
}

export const storage = new DatabaseStorage();
