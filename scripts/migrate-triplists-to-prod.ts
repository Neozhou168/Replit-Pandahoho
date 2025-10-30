import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

// Production DATABASE_URL from deployment secrets
const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_UKzta2x0ZyDY@ep-sparkling-forest-af0e1bzt.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

async function migrateTriplistsToProduction() {
  console.log("🚀 Starting triplists data migration to production...\n");

  // Connect to development database
  const devPool = new Pool({ connectionString: process.env.DATABASE_URL });
  const devDb = drizzle({ client: devPool, schema });

  // Connect to production database
  const prodPool = new Pool({ connectionString: PROD_DATABASE_URL });
  const prodDb = drizzle({ client: prodPool, schema });

  try {
    // Step 1: Clear production data (in correct order for foreign keys)
    console.log("🧹 Clearing production database...");
    await prodDb.delete(schema.triplistVenues);
    console.log("   ✅ Cleared triplist-venue relationships");
    await prodDb.delete(schema.triplists);
    console.log("   ✅ Cleared triplists");
    await prodDb.delete(schema.cities);
    console.log("   ✅ Cleared cities\n");

    // Step 2: Export cities from development
    console.log("📦 Exporting cities from development database...");
    const devCities = await devDb.select().from(schema.cities);
    console.log(`   Found ${devCities.length} cities in development\n`);

    // Step 3: Insert cities into production (preserve IDs)
    console.log("📥 Inserting cities into production database...");
    let insertedCities = 0;
    for (const city of devCities) {
      try {
        await prodDb.insert(schema.cities).values(city);
        insertedCities++;
      } catch (error: any) {
        console.error(`   ⚠️  Failed to insert city "${city.name}":`, error.message);
      }
    }
    console.log(`   ✅ Inserted ${insertedCities} cities\n`);

    // Step 4: Export triplists from development
    console.log("📦 Exporting triplists from development database...");
    const devTriplists = await devDb.select().from(schema.triplists);
    console.log(`   Found ${devTriplists.length} triplists in development\n`);

    // Step 5: Export triplist_venues from development
    console.log("📦 Exporting triplist-venue relationships from development...");
    const devTriplistVenues = await devDb.select().from(schema.triplistVenues);
    console.log(`   Found ${devTriplistVenues.length} triplist-venue relationships\n`);

    // Step 6: Insert triplists into production
    console.log("📥 Inserting triplists into production database...");
    let insertedTriplists = 0;
    for (const triplist of devTriplists) {
      try {
        await prodDb.insert(schema.triplists).values(triplist);
        insertedTriplists++;
      } catch (error: any) {
        console.error(`   ⚠️  Failed to insert triplist "${triplist.title}":`, error.message);
      }
    }
    console.log(`   ✅ Inserted ${insertedTriplists} triplists\n`);

    // Step 7: Insert triplist_venues into production
    console.log("📥 Inserting triplist-venue relationships into production...");
    let insertedRelationships = 0;
    for (const rel of devTriplistVenues) {
      try {
        await prodDb.insert(schema.triplistVenues).values(rel);
        insertedRelationships++;
      } catch (error: any) {
        console.error(`   ⚠️  Failed to insert relationship:`, error.message);
      }
    }
    console.log(`   ✅ Inserted ${insertedRelationships} triplist-venue relationships\n`);

    // Step 8: Verify the migration
    console.log("🔍 Verifying migration...");
    const prodTriplists = await prodDb.select().from(schema.triplists);
    console.log(`   Production now has ${prodTriplists.length} triplists\n`);

    // Count triplists per city in production
    const cityCountsResult = await prodDb.execute(
      sql`SELECT cities.name, CAST(COUNT(triplists.id) AS INTEGER) as count 
          FROM cities 
          LEFT JOIN triplists ON cities.id = triplists.city_id 
          GROUP BY cities.name 
          ORDER BY count DESC`
    );
    
    console.log("📊 Triplists per city in production:");
    for (const row of cityCountsResult.rows) {
      console.log(`   ${row.name}: ${row.count} triplists`);
    }

    console.log("\n✨ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await devPool.end();
    await prodPool.end();
  }
}

migrateTriplistsToProduction().catch(console.error);
