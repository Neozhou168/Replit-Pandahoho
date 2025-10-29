// PandaHoHo - Database Seed Script
import { db } from "./db";
import { storage } from "./storage";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create content settings - Countries
  console.log("Creating countries...");
  const china = await storage.createContentCountry({
    name: "China",
    isActive: true,
  });

  const usa = await storage.createContentCountry({
    name: "USA",
    isActive: true,
  });

  // Create content settings - Cities
  console.log("Creating content cities...");
  await storage.createContentCity({
    name: "Beijing",
    countryId: china.id,
    isActive: true,
  });

  await storage.createContentCity({
    name: "Shanghai",
    countryId: china.id,
    isActive: true,
  });

  await storage.createContentCity({
    name: "Chengdu",
    countryId: china.id,
    isActive: true,
  });

  await storage.createContentCity({
    name: "Xi'an",
    countryId: china.id,
    isActive: true,
  });

  await storage.createContentCity({
    name: "Hangzhou",
    countryId: china.id,
    isActive: true,
  });

  await storage.createContentCity({
    name: "Guangzhou",
    countryId: china.id,
    isActive: true,
  });

  await storage.createContentCity({
    name: "Chongqing",
    countryId: china.id,
    isActive: true,
  });

  await storage.createContentCity({
    name: "Shenzhen",
    countryId: china.id,
    isActive: true,
  });

  await storage.createContentCity({
    name: "Guilin",
    countryId: china.id,
    isActive: true,
  });

  await storage.createContentCity({
    name: "Suzhou",
    countryId: china.id,
    isActive: true,
  });

  // Create content settings - Travel Types
  console.log("Creating travel types...");
  await storage.createContentTravelType({
    name: "Attractions",
    description: "",
    displayOrder: 1,
    isActive: true,
  });

  await storage.createContentTravelType({
    name: "Eating",
    description: "Restaurants, cafes, and food experiences",
    displayOrder: 2,
    isActive: true,
  });

  await storage.createContentTravelType({
    name: "Hiking",
    description: "Outdoor walking and hiking activities",
    displayOrder: 2,
    isActive: true,
  });

  await storage.createContentTravelType({
    name: "Entertainment",
    description: "",
    displayOrder: 4,
    isActive: true,
  });

  await storage.createContentTravelType({
    name: "Art",
    description: "",
    displayOrder: 4,
    isActive: true,
  });

  await storage.createContentTravelType({
    name: "Shopping",
    description: "",
    displayOrder: 5,
    isActive: true,
  });

  await storage.createContentTravelType({
    name: "Cultural",
    description: "",
    displayOrder: 6,
    isActive: true,
  });

  await storage.createContentTravelType({
    name: "Nature",
    description: "",
    displayOrder: 7,
    isActive: true,
  });

  await storage.createContentTravelType({
    name: "Food & Drink",
    description: "",
    displayOrder: 8,
    isActive: true,
  });

  await storage.createContentTravelType({
    name: "Spa & Wellness",
    description: "",
    displayOrder: 9,
    isActive: true,
  });

  await storage.createContentTravelType({
    name: "Recovery",
    description: "",
    displayOrder: 10,
    isActive: true,
  });

  // Create content settings - Seasons
  console.log("Creating seasons...");
  await storage.createContentSeason({
    name: "All seasons",
    description: "",
    displayOrder: 0,
    isActive: true,
  });

  await storage.createContentSeason({
    name: "Spring",
    description: "",
    displayOrder: 1,
    isActive: true,
  });

  await storage.createContentSeason({
    name: "Summer",
    description: "",
    displayOrder: 2,
    isActive: true,
  });

  await storage.createContentSeason({
    name: "Autumn",
    description: "",
    displayOrder: 3,
    isActive: true,
  });

  await storage.createContentSeason({
    name: "Winter",
    description: "",
    displayOrder: 4,
    isActive: true,
  });

  await storage.createContentSeason({
    name: "Spring & Autumn",
    description: "",
    displayOrder: 6,
    isActive: true,
  });

  // Create carousel slides
  console.log("Creating carousel slides...");
  await storage.createCarouselItem({
    title: "Discover Hidden Gems in China",
    subtitle: "Explore curated travel experiences from locals and seasoned travelers",
    imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&h=1080&fit=crop",
    ctaText: "Explore Now",
    ctaLink: "/triplists",
    order: 0,
    isActive: true,
  });

  await storage.createCarouselItem({
    title: "Join Fellow Travelers",
    subtitle: "Create and join group-ups to explore China together",
    imageUrl: "https://images.unsplash.com/photo-1496016943515-7d33598c11e6?w=1920&h=1080&fit=crop",
    ctaText: "Find Group-Ups",
    ctaLink: "/triplists",
    order: 1,
    isActive: true,
  });

  await storage.createCarouselItem({
    title: "Essential Survival Guides",
    subtitle: "Master the art of traveling in China with insider tips and tricks",
    imageUrl: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1920&h=1080&fit=crop",
    ctaText: "View Guides",
    ctaLink: "/guides",
    order: 2,
    isActive: true,
  });

  // Create cities
  console.log("Creating cities...");
  const beijing = await storage.createCity({
    name: "Beijing",
    slug: "beijing",
    tagline: "Ancient capital meets modern metropolis",
    imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop",
    triplistCount: 0,
    countryId: china.id,
    isActive: true,
  });

  const shanghai = await storage.createCity({
    name: "Shanghai",
    slug: "shanghai",
    tagline: "Where East meets West in perfect harmony",
    imageUrl: "https://images.unsplash.com/photo-1537906408027-c7d7ba957829?w=800&h=600&fit=crop",
    triplistCount: 0,
    countryId: china.id,
    isActive: true,
  });

  const chengdu = await storage.createCity({
    name: "Chengdu",
    slug: "chengdu",
    tagline: "Land of pandas and spicy cuisine",
    imageUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&h=600&fit=crop",
    triplistCount: 0,
    countryId: china.id,
    isActive: true,
  });

  const xian = await storage.createCity({
    name: "Xi'an",
    slug: "xian",
    tagline: "Home of the Terracotta Warriors",
    imageUrl: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=600&fit=crop",
    triplistCount: 0,
    countryId: china.id,
    isActive: true,
  });

  const hangzhou = await storage.createCity({
    name: "Hangzhou",
    slug: "hangzhou",
    tagline: "Heaven on Earth with West Lake views",
    imageUrl: "https://images.unsplash.com/photo-1566996478543-2a1b5d56f6aa?w=800&h=600&fit=crop",
    triplistCount: 0,
    countryId: china.id,
    isActive: true,
  });

  const guangzhou = await storage.createCity({
    name: "Guangzhou",
    slug: "guangzhou",
    tagline: "Southern gateway with incredible Cantonese food",
    imageUrl: "https://images.unsplash.com/photo-1580589999376-b0fb45fbf333?w=800&h=600&fit=crop",
    triplistCount: 0,
    countryId: china.id,
    isActive: true,
  });

  const chongqing = await storage.createCity({
    name: "Chongqing",
    slug: "chongqing",
    tagline: "Mountain city with legendary hotpot",
    imageUrl: "https://images.unsplash.com/photo-1496016943515-7d33598c11e6?w=800&h=600&fit=crop",
    triplistCount: 0,
    countryId: china.id,
    isActive: true,
  });

  const shenzhen = await storage.createCity({
    name: "Shenzhen",
    slug: "shenzhen",
    tagline: "China's innovation hub and tech capital",
    imageUrl: "https://images.unsplash.com/photo-1589895363804-1f42159f2e79?w=800&h=600&fit=crop",
    triplistCount: 0,
    countryId: china.id,
    isActive: true,
  });

  // Create sample triplists
  console.log("Creating sample triplists...");
  const beijingHiking = await storage.createTriplist({
    title: "Beijing's Best Hiking Trails",
    slug: "beijing-hiking-trails",
    cityId: beijing.id,
    category: "Hiking",
    season: "Spring & Autumn",
    description: "Discover the most scenic hiking trails around Beijing, from the Great Wall to hidden mountain paths. These routes offer stunning views, historical sites, and a chance to escape the city bustle.",
    location: "Beijing, China",
    imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop",
    googleMapsEmbedUrl: null,
    isActive: true,
  });

  const shanghaiFood = await storage.createTriplist({
    title: "Shanghai Street Food Adventure",
    slug: "shanghai-street-food",
    cityId: shanghai.id,
    category: "Food & Drink",
    season: "All Seasons",
    description: "Embark on a culinary journey through Shanghai's best street food markets and hidden food stalls. From xiaolongbao to shengjianbao, discover authentic flavors.",
    location: "Shanghai, China",
    imageUrl: "https://images.unsplash.com/photo-1537906408027-c7d7ba957829?w=800&h=600&fit=crop",
    googleMapsEmbedUrl: null,
    isActive: true,
  });

  const chengduPandas = await storage.createTriplist({
    title: "Chengdu Panda & Tea Culture Tour",
    slug: "chengdu-pandas-tea",
    cityId: chengdu.id,
    category: "Nature & Culture",
    season: "All Seasons",
    description: "Experience Chengdu's famous pandas and ancient tea culture in this perfect day trip. Visit the Panda Research Base and traditional tea houses.",
    location: "Chengdu, China",
    imageUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&h=600&fit=crop",
    googleMapsEmbedUrl: null,
    isActive: true,
  });

  // Create sample venues
  console.log("Creating sample venues...");
  const mutianyu = await storage.createVenue({
    name: "Mutianyu Great Wall",
    slug: "mutianyu-great-wall",
    cityId: beijing.id,
    category: "Historical Site",
    description: "One of the best-preserved sections of the Great Wall, offering spectacular views and fewer crowds than Badaling. The wall features 23 watchtowers and stunning mountain scenery.",
    imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop",
    location: "Huairou District, Beijing",
    highlights: ["Cable car available", "Less crowded", "Stunning views", "Good hiking"],
    proTips: "📍 Best time: Early morning or late afternoon to avoid crowds\n🎫 Buy tickets online in advance\n🚌 Take the tourist bus from Dongzhimen\n👟 Wear comfortable hiking shoes\n💧 Bring water - limited vendors on the wall",
    googleMapsUrl: "https://goo.gl/maps/example1",
    isActive: true,
  });

  const bund = await storage.createVenue({
    name: "The Bund",
    slug: "the-bund-shanghai",
    cityId: shanghai.id,
    category: "Landmark",
    description: "Shanghai's iconic waterfront promenade featuring stunning colonial architecture and breathtaking skyline views. Perfect for evening strolls and photography.",
    imageUrl: "https://images.unsplash.com/photo-1537906408027-c7d7ba957829?w=800&h=600&fit=crop",
    location: "Huangpu District, Shanghai",
    highlights: ["Night views", "Historic architecture", "Photography spot", "River cruise"],
    proTips: "🌃 Visit at sunset for the best photos\n🚇 Take Metro Line 2 to East Nanjing Road\n📸 Best photo spots: near Waibaidu Bridge\n🌟 Light show starts at 7 PM",
    googleMapsUrl: "https://goo.gl/maps/example2",
    isActive: true,
  });

  // Create sample survival guides
  console.log("Creating sample survival guides...");
  await storage.createSurvivalGuide({
    title: "WeChat Pay & Alipay Setup Guide",
    slug: "wechat-pay-alipay-setup",
    description: "Essential guide to setting up mobile payments in China. Learn how to add your foreign credit card and navigate cashless society.",
    content: `📱 Why You Need Mobile Payments

China is largely cashless - from street vendors to taxis, everyone uses WeChat Pay or Alipay. Here's how to set them up:

🔧 WeChat Pay Setup
1. Download WeChat app
2. Create account with phone number
3. Go to Me > Payment > Add Card
4. Add your international credit card
5. Verify with SMS code

💳 Alipay Setup
1. Download Alipay app
2. Create account
3. Go to Me > Bank Cards
4. Add international credit card
5. Complete verification

⚠️ Important Tips
- Not all foreign cards work - Visa/Mastercard from major banks usually do
- Some vendors only accept one payment method
- Keep small amount of cash for emergencies
- Tourist card option available at airports

💡 Pro Tips
- Link both apps for maximum flexibility
- Take screenshot of payment QR codes
- Enable biometric authentication
- Check exchange rates before large purchases`,
    imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600&h=400&fit=crop",
    videoUrl: null,
    hasVideo: false,
    category: "China",
    isActive: true,
  });

  await storage.createSurvivalGuide({
    title: "Public Transport Master Guide",
    slug: "public-transport-guide",
    description: "Navigate China's metro systems like a local. Apps, cards, and essential tips for efficient travel.",
    content: `🚇 Metro Basics

Chinese metros are incredibly efficient, cheap, and easy to use once you know the basics.

📱 Essential Apps
- Baidu Maps (百度地图) - Best for navigation
- Metro apps for each city
- DiDi (Chinese Uber)

🎫 Payment Options
1. Transport Card - Buy at any station
2. Mobile QR code - Via Metro app
3. WeChat/Alipay integration

🗺️ Navigation Tips
- Stations have English signs
- Download offline maps
- Exit numbers matter - plan ahead
- Rush hours: 7-9 AM, 5-7 PM

⏰ Operating Hours
- Most metros: 6 AM - 11 PM
- Last trains around 10:30 PM
- Check specific line times

💡 Pro Tips
- Stand on right side of escalators
- Let passengers exit first
- Don't eat or drink on trains
- Keep your ticket until exit
- Security checks are common`,
    imageUrl: "https://images.unsplash.com/photo-1553163147-622ab57be555?w=600&h=400&fit=crop",
    videoUrl: null,
    hasVideo: false,
    category: "China",
    isActive: true,
  });

  console.log("✅ Seed completed successfully!");
}

// Run seed
seed()
  .then(() => {
    console.log("Seeding finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
