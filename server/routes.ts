// PandaHoHo - API Routes
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, isAdmin } from "./supabaseAuth";
import {
  insertCitySchema,
  insertVenueSchema,
  insertTriplistSchema,
  insertSurvivalGuideSchema,
  insertGroupUpSchema,
  insertCarouselItemSchema,
  insertContentCountrySchema,
  insertContentTravelTypeSchema,
  insertContentSeasonSchema,
  updateUserSchema,
  insertPageViewSchema,
  insertSeoSettingsSchema,
  type Venue,
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getAnalyticsStats } from "./analytics";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // ========== Auth Routes ==========
  app.get("/api/auth/me", isAuthenticated, async (req: any, res) => {
    try {
      const supabaseUser = req.user;
      const userId = supabaseUser.id;
      const metadata = supabaseUser.user_metadata || {};
      const provider = supabaseUser.app_metadata?.provider || 'email';
      
      console.log('[Auth] User ID:', userId);
      console.log('[Auth] Provider:', provider);
      console.log('[Auth] Metadata:', metadata);
      
      let user = await storage.getUser(userId);
      
      if (!user) {
        console.log('[Auth] User not in DB, creating...');
        try {
          user = await storage.upsertUser({
            id: userId,
            email: supabaseUser.email || null,
            firstName: metadata.full_name?.split(' ')[0] || metadata.first_name || metadata.name?.split(' ')[0] || null,
            lastName: metadata.full_name?.split(' ').slice(1).join(' ') || metadata.last_name || metadata.name?.split(' ').slice(1).join(' ') || null,
            profileImageUrl: metadata.picture || metadata.avatar_url || null,
            authProvider: provider,
            role: metadata.role || 'member',
            isAdmin: metadata.is_admin === true,
            lastLoginAt: new Date(),
          });
          console.log('[Auth] User created:', user.id);
        } catch (dbError) {
          console.error('[Auth] DB Error creating user:', dbError);
          return res.json({
            id: userId,
            email: supabaseUser.email,
            firstName: metadata.full_name?.split(' ')[0] || metadata.first_name || null,
            lastName: metadata.full_name?.split(' ').slice(1).join(' ') || metadata.last_name || null,
            profileImageUrl: metadata.picture || metadata.avatar_url || null,
            authProvider: provider,
            role: 'member',
            isAdmin: false,
          });
        }
      } else {
        const newProfileImageUrl = metadata.picture || metadata.avatar_url || user.profileImageUrl;
        const shouldUpdate = newProfileImageUrl !== user.profileImageUrl || 
                           metadata.is_admin !== undefined && metadata.is_admin !== user.isAdmin;
        
        if (shouldUpdate) {
          console.log('[Auth] User data changed, updating...');
          try {
            user = await storage.updateUser(userId, {
              email: supabaseUser.email || user.email,
              firstName: metadata.full_name?.split(' ')[0] || metadata.first_name || user.firstName,
              lastName: metadata.full_name?.split(' ').slice(1).join(' ') || metadata.last_name || user.lastName,
              profileImageUrl: newProfileImageUrl,
              role: metadata.role || user.role,
              isAdmin: metadata.is_admin ?? user.isAdmin,
              lastLoginAt: new Date(),
            });
            console.log('[Auth] User updated');
          } catch (updateError) {
            console.error('[Auth] Error updating user:', updateError);
          }
        } else {
          console.log('[Auth] No changes detected, skipping update');
        }
      }
      
      res.json(user);
    } catch (error) {
      console.error("[Auth] Critical error in /api/auth/me:", error);
      res.status(500).json({ 
        message: "Failed to fetch user",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ========== User Profile Routes ==========
  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validation = updateUserSchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      let user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user = await storage.updateUser(userId, validation.data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const upload = multer({ storage: multer.memoryStorage() });

  app.post("/api/profile/avatar", isAuthenticated, upload.single("avatar"), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ message: "Invalid file type. Only JPG, PNG, and WebP are allowed" });
      }

      if (file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "File size must be less than 2MB" });
      }

      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'pandahoho/Avatars',
            public_id: userId,
            overwrite: true,
            transformation: [
              { width: 500, height: 500, crop: 'fill', gravity: 'face' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      const avatarUrl = (uploadResult as any).secure_url;

      const user = await storage.updateUser(userId, { profileImageUrl: avatarUrl });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ avatarUrl });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });

  // ========== Admin User Management Routes ==========
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = updateUserSchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const user = await storage.updateUser(req.params.id, validation.data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // ========== City Routes ==========
  app.get("/api/cities", async (_req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  app.get("/api/cities/:slug", async (req, res) => {
    try {
      const city = await storage.getCity(req.params.slug);
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
      res.json(city);
    } catch (error) {
      console.error("Error fetching city:", error);
      res.status(500).json({ message: "Failed to fetch city" });
    }
  });

  app.post("/api/cities", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertCitySchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const city = await storage.createCity(validation.data);
      res.status(201).json(city);
    } catch (error) {
      console.error("Error creating city:", error);
      res.status(500).json({ message: "Failed to create city" });
    }
  });

  app.put("/api/cities/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertCitySchema.partial().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const city = await storage.updateCity(req.params.id, validation.data);
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
      res.json(city);
    } catch (error) {
      console.error("Error updating city:", error);
      res.status(500).json({ message: "Failed to update city" });
    }
  });

  app.delete("/api/cities/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteCity(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting city:", error);
      // Check if it's a foreign key constraint error
      if (error.code === '23503' && error.constraint === 'triplists_city_id_cities_id_fk') {
        return res.status(409).json({ 
          message: "Cannot delete city. Please delete all triplists associated with this city first." 
        });
      }
      res.status(500).json({ message: "Failed to delete city" });
    }
  });

  app.post("/api/cities/bulk", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertCitySchema.array().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const cities = await storage.bulkCreateCities(validation.data);
      res.status(201).json({ count: cities.length, cities });
    } catch (error) {
      console.error("Error bulk creating cities:", error);
      res.status(500).json({ message: "Failed to bulk create cities" });
    }
  });

  // ========== Venue Routes ==========
  app.get("/api/venues", async (req, res) => {
    try {
      const triplistId = req.query.triplistId as string | undefined;
      const venues = await storage.getVenues(triplistId ? { triplistId } : undefined);
      res.json(venues);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  app.get("/api/venues/:slug", async (req, res) => {
    try {
      const venue = await storage.getVenue(req.params.slug);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ message: "Failed to fetch venue" });
    }
  });

  app.post("/api/venues", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertVenueSchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const venue = await storage.createVenue(validation.data);
      res.status(201).json(venue);
    } catch (error) {
      console.error("Error creating venue:", error);
      res.status(500).json({ message: "Failed to create venue" });
    }
  });

  app.put("/api/venues/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertVenueSchema.partial().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const venue = await storage.updateVenue(req.params.id, validation.data);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error updating venue:", error);
      res.status(500).json({ message: "Failed to update venue" });
    }
  });

  app.delete("/api/venues/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteVenue(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting venue:", error);
      res.status(500).json({ message: "Failed to delete venue" });
    }
  });

  app.post("/api/venues/bulk", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertVenueSchema.array().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const result = await storage.bulkCreateVenues(validation.data);
      
      res.status(201).json({ 
        count: result.venues.length,
        created: result.created,
        updated: result.updated,
        venues: result.venues
      });
    } catch (error) {
      console.error("Error bulk creating venues:", error);
      res.status(500).json({ message: "Failed to bulk create venues" });
    }
  });

  // ========== Triplist Routes ==========
  app.get("/api/triplists", async (_req, res) => {
    try {
      const triplists = await storage.getTriplists();
      res.json(triplists);
    } catch (error) {
      console.error("Error fetching triplists:", error);
      res.status(500).json({ message: "Failed to fetch triplists" });
    }
  });

  app.get("/api/triplists/:slug", async (req, res) => {
    try {
      const triplist = await storage.getTriplist(req.params.slug);
      if (!triplist) {
        return res.status(404).json({ message: "Triplist not found" });
      }
      res.json(triplist);
    } catch (error) {
      console.error("Error fetching triplist:", error);
      res.status(500).json({ message: "Failed to fetch triplist" });
    }
  });

  app.post("/api/triplists", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertTriplistSchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const triplist = await storage.createTriplist(validation.data);
      res.status(201).json(triplist);
    } catch (error) {
      console.error("Error creating triplist:", error);
      res.status(500).json({ message: "Failed to create triplist" });
    }
  });

  app.put("/api/triplists/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertTriplistSchema.partial().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const triplist = await storage.updateTriplist(req.params.id, validation.data);
      if (!triplist) {
        return res.status(404).json({ message: "Triplist not found" });
      }
      res.json(triplist);
    } catch (error) {
      console.error("Error updating triplist:", error);
      res.status(500).json({ message: "Failed to update triplist" });
    }
  });

  app.delete("/api/triplists/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteTriplist(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting triplist:", error);
      res.status(500).json({ message: "Failed to delete triplist" });
    }
  });

  app.post("/api/triplists/bulk", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertTriplistSchema.array().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const triplists = await storage.bulkCreateTriplists(validation.data);
      res.status(201).json({ count: triplists.length, triplists });
    } catch (error) {
      console.error("Error bulk creating triplists:", error);
      res.status(500).json({ message: "Failed to bulk create triplists" });
    }
  });

  app.post("/api/triplists/sync-venues", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const result = await storage.syncTriplistVenues();
      res.json(result);
    } catch (error) {
      console.error("Error syncing triplist venues:", error);
      res.status(500).json({ message: "Failed to sync triplist venues" });
    }
  });

  app.delete("/api/triplists", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const result = await storage.deleteAllTriplists();
      res.json(result);
    } catch (error) {
      console.error("Error deleting all triplists:", error);
      res.status(500).json({ message: "Failed to delete all triplists" });
    }
  });

  // ========== Survival Guide Routes ==========
  app.get("/api/guides", async (_req, res) => {
    try {
      const guides = await storage.getSurvivalGuides();
      res.json(guides);
    } catch (error) {
      console.error("Error fetching guides:", error);
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  app.get("/api/guides/:slug", async (req, res) => {
    try {
      const guide = await storage.getSurvivalGuide(req.params.slug);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      console.error("Error fetching guide:", error);
      res.status(500).json({ message: "Failed to fetch guide" });
    }
  });

  app.post("/api/guides", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertSurvivalGuideSchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const guide = await storage.createSurvivalGuide(validation.data);
      res.status(201).json(guide);
    } catch (error) {
      console.error("Error creating guide:", error);
      res.status(500).json({ message: "Failed to create guide" });
    }
  });

  app.put("/api/guides/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertSurvivalGuideSchema.partial().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const guide = await storage.updateSurvivalGuide(req.params.id, validation.data);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      console.error("Error updating guide:", error);
      res.status(500).json({ message: "Failed to update guide" });
    }
  });

  app.delete("/api/guides/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteSurvivalGuide(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting guide:", error);
      res.status(500).json({ message: "Failed to delete guide" });
    }
  });

  app.post("/api/guides/bulk", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertSurvivalGuideSchema.array().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const guides = await storage.bulkCreateSurvivalGuides(validation.data);
      res.status(201).json({ count: guides.length, guides });
    } catch (error) {
      console.error("Error bulk creating guides:", error);
      res.status(500).json({ message: "Failed to bulk create guides" });
    }
  });

  // ========== Group-Up Routes ==========
  app.get("/api/group-ups", async (req, res) => {
    try {
      const triplistId = req.query.triplistId as string | undefined;
      const groupUps = await storage.getGroupUps(
        triplistId ? { triplistId } : undefined
      );
      res.json(groupUps);
    } catch (error) {
      console.error("Error fetching group-ups:", error);
      res.status(500).json({ message: "Failed to fetch group-ups" });
    }
  });

  app.post("/api/group-ups", isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertGroupUpSchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const userId = req.user.id;
      const groupUp = await storage.createGroupUp({
        ...validation.data,
        userId,
      });
      res.status(201).json(groupUp);
    } catch (error) {
      console.error("Error creating group-up:", error);
      res.status(500).json({ message: "Failed to create group-up" });
    }
  });

  // ========== Carousel Routes ==========
  app.get("/api/carousel", async (_req, res) => {
    try {
      const items = await storage.getCarouselItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching carousel items:", error);
      res.status(500).json({ message: "Failed to fetch carousel items" });
    }
  });

  app.post("/api/carousel", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const item = await storage.createCarouselItem({
        title: req.body.title,
        subtitle: req.body.subtitle,
        imageUrl: req.body.imageUrl,
        ctaText: req.body.ctaText || null,
        ctaLink: req.body.ctaLink || null,
        order: req.body.order ?? 0,
        isActive: true,
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating carousel item:", error);
      res.status(500).json({ message: "Failed to create carousel item" });
    }
  });

  app.put("/api/carousel/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const item = await storage.updateCarouselItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating carousel item:", error);
      res.status(500).json({ message: "Failed to update carousel item" });
    }
  });

  app.delete("/api/carousel/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteCarouselItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting carousel item:", error);
      res.status(500).json({ message: "Failed to delete carousel item" });
    }
  });

  app.post("/api/carousel/bulk", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertCarouselItemSchema.array().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const normalizedData = validation.data.map(item => ({
        ...item,
        isActive: item.isActive ?? null,
        ctaText: item.ctaText ?? null,
        ctaLink: item.ctaLink ?? null,
        order: item.order ?? null,
      }));

      const items = await storage.bulkCreateCarouselItems(normalizedData);
      res.status(201).json({ count: items.length, items });
    } catch (error) {
      console.error("Error bulk creating carousel items:", error);
      res.status(500).json({ message: "Failed to bulk create carousel items" });
    }
  });

  // ========== Content Settings - Countries ==========
  app.get("/api/content/countries", async (_req, res) => {
    try {
      const countries = await storage.getContentCountries();
      res.json(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });

  app.post("/api/content/countries", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertContentCountrySchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const country = await storage.createContentCountry(validation.data);
      res.status(201).json(country);
    } catch (error: any) {
      console.error("Error creating country:", error);
      if (error.code === '23505') {
        return res.status(409).json({ message: `Country "${req.body.name}" already exists` });
      }
      res.status(500).json({ message: "Failed to create country" });
    }
  });

  app.put("/api/content/countries/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertContentCountrySchema.partial().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const country = await storage.updateContentCountry(req.params.id, validation.data);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      res.json(country);
    } catch (error) {
      console.error("Error updating country:", error);
      res.status(500).json({ message: "Failed to update country" });
    }
  });

  app.delete("/api/content/countries/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteContentCountry(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting country:", error);
      res.status(500).json({ message: "Failed to delete country" });
    }
  });

  // ========== Content Settings - Travel Types ==========
  app.get("/api/content/travel-types", async (_req, res) => {
    try {
      const travelTypes = await storage.getContentTravelTypes();
      res.json(travelTypes);
    } catch (error) {
      console.error("Error fetching travel types:", error);
      res.status(500).json({ message: "Failed to fetch travel types" });
    }
  });

  app.post("/api/content/travel-types", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertContentTravelTypeSchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const travelType = await storage.createContentTravelType(validation.data);
      res.status(201).json(travelType);
    } catch (error: any) {
      console.error("Error creating travel type:", error);
      if (error.code === '23505') {
        return res.status(409).json({ message: `Travel type "${req.body.name}" already exists` });
      }
      res.status(500).json({ message: "Failed to create travel type" });
    }
  });

  app.put("/api/content/travel-types/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertContentTravelTypeSchema.partial().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const travelType = await storage.updateContentTravelType(req.params.id, validation.data);
      if (!travelType) {
        return res.status(404).json({ message: "Travel type not found" });
      }
      res.json(travelType);
    } catch (error) {
      console.error("Error updating travel type:", error);
      res.status(500).json({ message: "Failed to update travel type" });
    }
  });

  app.delete("/api/content/travel-types/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteContentTravelType(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting travel type:", error);
      res.status(500).json({ message: "Failed to delete travel type" });
    }
  });

  app.put("/api/content/travel-types/:id/order", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { displayOrder } = req.body;
      if (typeof displayOrder !== "number") {
        return res.status(400).json({ message: "displayOrder must be a number" });
      }

      await storage.updateContentTravelTypeOrder(req.params.id, displayOrder);
      res.status(204).send();
    } catch (error) {
      console.error("Error updating travel type order:", error);
      res.status(500).json({ message: "Failed to update travel type order" });
    }
  });

  // ========== Content Settings - Seasons ==========
  app.get("/api/content/seasons", async (_req, res) => {
    try {
      const seasons = await storage.getContentSeasons();
      res.json(seasons);
    } catch (error) {
      console.error("Error fetching seasons:", error);
      res.status(500).json({ message: "Failed to fetch seasons" });
    }
  });

  app.post("/api/content/seasons", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertContentSeasonSchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const season = await storage.createContentSeason(validation.data);
      res.status(201).json(season);
    } catch (error: any) {
      console.error("Error creating season:", error);
      if (error.code === '23505') {
        return res.status(409).json({ message: `Season "${req.body.name}" already exists` });
      }
      res.status(500).json({ message: "Failed to create season" });
    }
  });

  app.put("/api/content/seasons/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertContentSeasonSchema.partial().safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const season = await storage.updateContentSeason(req.params.id, validation.data);
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }
      res.json(season);
    } catch (error) {
      console.error("Error updating season:", error);
      res.status(500).json({ message: "Failed to update season" });
    }
  });

  app.delete("/api/content/seasons/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteContentSeason(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting season:", error);
      res.status(500).json({ message: "Failed to delete season" });
    }
  });

  app.put("/api/content/seasons/:id/order", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { displayOrder } = req.body;
      if (typeof displayOrder !== "number") {
        return res.status(400).json({ message: "displayOrder must be a number" });
      }

      await storage.updateContentSeasonOrder(req.params.id, displayOrder);
      res.status(204).send();
    } catch (error) {
      console.error("Error updating season order:", error);
      res.status(500).json({ message: "Failed to update season order" });
    }
  });

  // ========== Branding Routes ==========
  app.get("/api/branding", async (_req, res) => {
    try {
      const brandingSettings = await storage.getBranding();
      res.json(brandingSettings);
    } catch (error) {
      console.error("Error fetching branding:", error);
      res.status(500).json({ message: "Failed to fetch branding settings" });
    }
  });

  app.put("/api/branding", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const brandingSettings = await storage.updateBranding(req.body);
      res.json(brandingSettings);
    } catch (error) {
      console.error("Error updating branding:", error);
      res.status(500).json({ message: "Failed to update branding settings" });
    }
  });

  // ========== Analytics Routes ==========
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const pageViewData = insertPageViewSchema.parse(req.body);
      await storage.trackPageView(pageViewData);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error tracking page view:", error);
      res.status(500).json({ message: "Failed to track page view" });
    }
  });

  app.get("/api/analytics/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const timeRange = (req.query.timeRange as string) || "24h";
      const stats = await getAnalyticsStats(timeRange);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching analytics stats:", error);
      res.status(500).json({ message: "Failed to fetch analytics stats" });
    }
  });

  // ========== SEO Settings Routes ==========
  // Public route to get global SEO settings
  app.get("/api/seo/global", async (_req, res) => {
    try {
      const settings = await storage.getSeoSettings("global");
      res.json(settings || {
        pageType: "global",
        metaTitle: null,
        metaDescription: null,
        keywords: [],
        canonicalUrl: null,
        robotsMetaTag: "index, follow",
        schemaMarkup: null,
      });
    } catch (error) {
      console.error("Error fetching global SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch global SEO settings" });
    }
  });

  // Admin route to update global SEO settings
  app.put("/api/seo/global", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Use partial schema for updates, then merge with required global fields
      const validation = insertSeoSettingsSchema.partial().safeParse(req.body);

      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      // Merge validated data with required global settings fields
      const settings = await storage.upsertSeoSettings({
        ...validation.data,
        pageType: "global",
        pageIdentifier: null,
      });
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating global SEO settings:", error);
      res.status(500).json({ message: error.message || "Failed to update global SEO settings" });
    }
  });

  // Valid page types for SEO management
  const VALID_PAGE_TYPES = ["global", "homepage", "cities", "triplists", "venues", "guides"] as const;

  // Admin route to get SEO settings for a specific page type
  app.get("/api/seo/page/:pageType", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pageType } = req.params;
      
      // Validate page type
      if (!VALID_PAGE_TYPES.includes(pageType as any)) {
        return res.status(400).json({ 
          message: `Invalid page type. Supported types: ${VALID_PAGE_TYPES.join(", ")}` 
        });
      }
      
      const settings = await storage.getSeoSettings(pageType);
      res.json(settings || {
        pageType,
        pageIdentifier: null,
        metaTitle: null,
        metaDescription: null,
        keywords: [],
        canonicalUrl: null,
        robotsMetaTag: "index, follow",
        schemaMarkup: null,
      });
    } catch (error) {
      console.error(`Error fetching SEO settings for ${req.params.pageType}:`, error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  // Admin route to update SEO settings for a specific page type
  app.put("/api/seo/page/:pageType", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pageType } = req.params;
      
      // Validate page type
      if (!VALID_PAGE_TYPES.includes(pageType as any)) {
        return res.status(400).json({ 
          message: `Invalid page type. Supported types: ${VALID_PAGE_TYPES.join(", ")}` 
        });
      }
      
      // Use partial schema for updates, then merge with required fields
      const validation = insertSeoSettingsSchema.partial().safeParse(req.body);

      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      // Merge validated data with required page type fields
      const settings = await storage.upsertSeoSettings({
        ...validation.data,
        pageType,
        pageIdentifier: null,
      });
      res.json(settings);
    } catch (error: any) {
      console.error(`Error updating SEO settings for ${req.params.pageType}:`, error);
      res.status(500).json({ message: error.message || "Failed to update SEO settings" });
    }
  });

  // Admin route to get all SEO settings (with optional filters)
  app.get("/api/seo/settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pageType = req.query.pageType as string | undefined;
      const pageIdentifier = req.query.pageIdentifier as string | undefined;

      if (pageType && pageIdentifier) {
        const settings = await storage.getSeoSettings(pageType, pageIdentifier);
        res.json(settings || null);
      } else {
        const allSettings = await storage.getAllSeoSettings();
        res.json(allSettings);
      }
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  // Admin route to create/upsert SEO settings
  app.post("/api/seo/settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertSeoSettingsSchema.safeParse(req.body);

      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const settings = await storage.upsertSeoSettings(validation.data);
      res.status(201).json(settings);
    } catch (error: any) {
      console.error("Error creating SEO settings:", error);
      res.status(500).json({ message: error.message || "Failed to create SEO settings" });
    }
  });

  // Admin route to update specific SEO settings by ID
  app.put("/api/seo/settings/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertSeoSettingsSchema.partial().safeParse(req.body);

      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const settings = await storage.updateSeoSettings(req.params.id, validation.data);
      if (!settings) {
        return res.status(404).json({ message: "SEO settings not found" });
      }
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating SEO settings:", error);
      res.status(500).json({ message: error.message || "Failed to update SEO settings" });
    }
  });

  // Admin route to delete SEO settings
  app.delete("/api/seo/settings/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteSeoSettings(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting SEO settings:", error);
      res.status(500).json({ message: "Failed to delete SEO settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
