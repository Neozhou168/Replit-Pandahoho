import { db } from "../server/db";
import { hashtags, triplistHashtags } from "../shared/schema";
import { eq } from "drizzle-orm";

async function exportHashtagsToSQL() {
  console.log("=".repeat(80));
  console.log("HASHTAG DATA MIGRATION - Development to Production");
  console.log("=".repeat(80));
  console.log();

  try {
    // Fetch all hashtags from dev database
    const allHashtags = await db.select().from(hashtags).orderBy(hashtags.displayOrder);
    
    // Fetch all triplist-hashtag associations
    const allAssociations = await db.select().from(triplistHashtags);

    console.log(`Found ${allHashtags.length} hashtags and ${allAssociations.length} triplist associations`);
    console.log();
    console.log("=".repeat(80));
    console.log("STEP 1: Copy the SQL below and run it in your PRODUCTION database");
    console.log("=".repeat(80));
    console.log();
    console.log("-- Step 1a: Insert Hashtags");
    console.log("-- Run this SQL in the production database pane");
    console.log();

    if (allHashtags.length === 0) {
      console.log("-- No hashtags to migrate");
    } else {
      // Generate INSERT statements for hashtags
      console.log("INSERT INTO hashtags (id, name, \"isPromoted\", \"displayOrder\", \"isActive\", \"createdAt\") VALUES");
      
      const hashtagValues = allHashtags.map((h, index) => {
        const isLast = index === allHashtags.length - 1;
        const createdAt = h.createdAt instanceof Date ? h.createdAt.toISOString() : h.createdAt;
        return `  ('${h.id}', '${h.name.replace(/'/g, "''")}', ${h.isPromoted}, ${h.displayOrder}, ${h.isActive}, '${createdAt}')${isLast ? ';' : ','}`;
      });
      
      console.log(hashtagValues.join('\n'));
    }

    console.log();
    console.log("-- Step 1b: Link Hashtags to Triplists");
    console.log();

    if (allAssociations.length === 0) {
      console.log("-- No triplist-hashtag associations to migrate");
    } else {
      // Generate INSERT statements for triplist_hashtags
      console.log("INSERT INTO triplist_hashtags (\"triplistId\", \"hashtagId\") VALUES");
      
      const associationValues = allAssociations.map((a, index) => {
        const isLast = index === allAssociations.length - 1;
        return `  ('${a.triplistId}', '${a.hashtagId}')${isLast ? ';' : ','}`;
      });
      
      console.log(associationValues.join('\n'));
    }

    console.log();
    console.log("=".repeat(80));
    console.log("INSTRUCTIONS:");
    console.log("=".repeat(80));
    console.log("1. Go to your Replit project");
    console.log("2. Click on 'Database' in the left sidebar (Tools section)");
    console.log("3. Switch to the 'Production' tab at the top");
    console.log("4. Copy the SQL above");
    console.log("5. Paste it into the SQL query box");
    console.log("6. Click 'Run' to execute");
    console.log("7. Refresh your production site to see hashtags!");
    console.log("=".repeat(80));
    console.log();
    console.log("✅ Migration SQL generated successfully!");
    console.log();

    // Also output a summary for reference
    console.log("SUMMARY:");
    console.log(`- ${allHashtags.length} hashtags to import`);
    console.log(`- ${allHashtags.filter(h => h.isPromoted).length} promoted hashtags (will appear in filter bar)`);
    console.log(`- ${allAssociations.length} triplist-hashtag links`);
    console.log();

    if (allHashtags.length > 0) {
      console.log("Hashtags being migrated:");
      allHashtags.forEach(h => {
        console.log(`  - ${h.name} ${h.isPromoted ? '(promoted)' : ''}`);
      });
    }

  } catch (error) {
    console.error("Error generating migration SQL:", error);
    process.exit(1);
  }

  process.exit(0);
}

exportHashtagsToSQL();
