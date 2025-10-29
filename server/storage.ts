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
  content_countries,
  content_travel_types,
  content_seasons,
  content_cities,
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
  type ContentCountry,
  type InsertContentCountry,
  type ContentTravelType,
  type InsertContentTravelType,
  type ContentSeason,
  type InsertContentSeason,
  type ContentCity,
  type InsertContentCity,
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
  bulkCreateCities(cities: InsertCity[]): Promise<City[]>;

  // Venue operations
  getVenues(filters?: { triplistId?: string }): Promise<Venue[]>;
  getVenue(slug: string): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: string, venue: Partial<InsertVenue>): Promise<Venue | undefined>;
  deleteVenue(id: string): Promise<void>;
  bulkCreateVenues(venues: InsertVenue[]): Promise<Venue[]>;

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

  // Content Settings - Cities
  getContentCities(): Promise<ContentCity[]>;
  createContentCity(city: InsertContentCity): Promise<ContentCity>;
  updateContentCity(id: string, city: Partial<InsertContentCity>): Promise<ContentCity | undefined>;
  deleteContentCity(id: string): Promise<void>;
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

  async bulkCreateCities(citiesData: InsertCity[]): Promise<City[]> {
    if (citiesData.length === 0) return [];
    return db.insert(cities).values(citiesData).returning();
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

  async bulkCreateVenues(venuesData: InsertVenue[]): Promise<Venue[]> {
    if (venuesData.length === 0) return [];
    
    // Upsert logic: match by name to avoid duplicates
    const allExistingVenues = await db.select().from(venues);
    const existingByName = new Map(
      allExistingVenues.map(v => [v.name.toLowerCase(), v])
    );
    const existingById = new Map(allExistingVenues.map(v => [v.id, v]));
    
    const results: Venue[] = [];
    
    for (const venueData of venuesData) {
      const csvId = venueData.id;
      const existingByThisName = existingByName.get(venueData.name.toLowerCase());
      const existingByThisId = csvId ? existingById.get(csvId) : undefined;
      
      if (existingByThisId) {
        // CSV ID exists in DB - just update with CSV data (excluding id)
        const { id, ...updateData } = venueData;
        const [updated] = await db
          .update(venues)
          .set(updateData)
          .where(eq(venues.id, csvId!))
          .returning();
        results.push(updated);
      } else if (existingByThisName && csvId && existingByThisName.id !== csvId) {
        // Name matches but different ID - need to replace with new ID
        await db.transaction(async (tx) => {
          // Step 1: Temporarily rename old record's slug to avoid conflict
          await tx
            .update(venues)
            .set({ slug: `${existingByThisName.slug}_old_${Date.now()}` })
            .where(eq(venues.id, existingByThisName.id));
          
          // Step 2: Insert new record with CSV ID
          await tx.insert(venues).values(venueData);
          
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
      } else if (existingByThisName) {
        // Name matches, no ID conflict - just update (excluding id)
        const { id, ...updateData } = venueData;
        const [updated] = await db
          .update(venues)
          .set(updateData)
          .where(eq(venues.id, existingByThisName.id))
          .returning();
        results.push(updated);
      } else {
        // New venue - insert
        const [venue] = await db.insert(venues).values(venueData).returning();
        results.push(venue);
      }
    }
    
    return results;
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
    const [triplist] = await db
      .update(triplists)
      .set(triplistData)
      .where(eq(triplists.id, id))
      .returning();
    
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
    await db.delete(triplistVenues).where(eq(triplistVenues.triplistId, id));
    await db.delete(groupUps).where(eq(groupUps.triplistId, id));
    await db.delete(triplists).where(eq(triplists.id, id));
  }

  async deleteAllTriplists(): Promise<{ deleted: number }> {
    // Get count before deleting
    const allTriplists = await db.select().from(triplists);
    const count = allTriplists.length;
    
    // Delete all related records first
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

  // ========== Content Settings - Cities ==========
  async getContentCities(): Promise<ContentCity[]> {
    return db.select().from(content_cities).orderBy(content_cities.name);
  }

  async createContentCity(cityData: InsertContentCity): Promise<ContentCity> {
    const [city] = await db.insert(content_cities).values(cityData).returning();
    return city;
  }

  async updateContentCity(id: string, cityData: Partial<InsertContentCity>): Promise<ContentCity | undefined> {
    const [city] = await db
      .update(content_cities)
      .set(cityData)
      .where(eq(content_cities.id, id))
      .returning();
    return city;
  }

  async deleteContentCity(id: string): Promise<void> {
    await db.delete(content_cities).where(eq(content_cities.id, id));
  }
}

export const storage = new DatabaseStorage();
