// Migration script to convert content_travel_types to hashtags system
// This script will:
// 1. Create hashtag records from existing content_travel_types (marked as promoted)
// 2. Create hashtag records from unique category values in triplists
// 3. Link each triplist to its corresponding hashtag

import { db } from "../db";
import { 
  content_travel_types, 
  hashtags, 
  triplists, 
  triplistHashtags 
} from "../../shared/schema";
import { eq, sql } from "drizzle-orm";

export async function migrateToHashtags() {
  console.log("🚀 Starting hashtag migration...");
  
  try {
    // Step 1: Get all existing content_travel_types
    const travelTypes = await db
      .select()
      .from(content_travel_types)
      .where(eq(content_travel_types.isActive, true));
    
    console.log(`✅ Found ${travelTypes.length} travel types to migrate`);
    
    // Step 2: Create hashtag records for each travel type (marked as promoted)
    const hashtagMap = new Map<string, string>(); // Map: name -> hashtagId
    
    for (const travelType of travelTypes) {
      const [newHashtag] = await db
        .insert(hashtags)
        .values({
          name: travelType.name,
          isPromoted: true, // All migrated travel types are promoted
          displayOrder: travelType.displayOrder,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: hashtags.name,
          set: {
            isPromoted: true,
            displayOrder: travelType.displayOrder,
          },
        })
        .returning();
      
      hashtagMap.set(newHashtag.name, newHashtag.id);
      console.log(`  ✓ Created promoted hashtag: ${newHashtag.name}`);
    }
    
    // Step 3: Get all triplists with categories
    const allTriplists = await db
      .select()
      .from(triplists)
      .where(sql`${triplists.category} IS NOT NULL AND ${triplists.category} != ''`);
    
    console.log(`✅ Found ${allTriplists.length} triplists with categories`);
    
    // Step 4: Create hashtags for any category values not in travel types
    const uniqueCategories = Array.from(
      new Set(allTriplists.map(t => t.category).filter(Boolean))
    ) as string[];
    
    for (const category of uniqueCategories) {
      if (!hashtagMap.has(category)) {
        // Check if hashtag already exists
        const [existing] = await db
          .select()
          .from(hashtags)
          .where(eq(hashtags.name, category));
        
        if (existing) {
          // Use existing hashtag
          hashtagMap.set(existing.name, existing.id);
          console.log(`  ✓ Found existing hashtag: ${existing.name}`);
        } else {
          // Create non-promoted hashtag for categories not in travel types
          const [newHashtag] = await db
            .insert(hashtags)
            .values({
              name: category,
              isPromoted: false,
              displayOrder: 999,
              isActive: true,
            })
            .returning();
          
          hashtagMap.set(newHashtag.name, newHashtag.id);
          console.log(`  ✓ Created hashtag from triplist category: ${newHashtag.name}`);
        }
      }
    }
    
    // Step 5: Link each triplist to its category hashtag
    let linkedCount = 0;
    for (const triplist of allTriplists) {
      if (triplist.category) {
        const hashtagId = hashtagMap.get(triplist.category);
        if (hashtagId) {
          await db
            .insert(triplistHashtags)
            .values({
              triplistId: triplist.id,
              hashtagId: hashtagId,
              order: 0, // First hashtag
            })
            .onConflictDoNothing(); // Skip if already exists
          
          linkedCount++;
        }
      }
    }
    
    console.log(`✅ Linked ${linkedCount} triplists to hashtags`);
    console.log(`🎉 Migration complete! Created ${hashtagMap.size} hashtags total`);
    
    return {
      success: true,
      travelTypesConverted: travelTypes.length,
      hashtagsCreated: hashtagMap.size,
      triplistsLinked: linkedCount,
    };
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToHashtags()
    .then((result) => {
      console.log("\n📊 Migration Summary:");
      console.log(`  - Travel types converted: ${result.travelTypesConverted}`);
      console.log(`  - Total hashtags created: ${result.hashtagsCreated}`);
      console.log(`  - Triplists linked: ${result.triplistsLinked}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Migration error:", error);
      process.exit(1);
    });
}
