/**
 * Seed script for Railway deployment
 * Run: node seed-users.mjs
 * Creates the 4 predefined platform users if they don't exist
 */
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const USERS = [
  {
    userId: "MRUHAILY",
    password: "15001500",
    name: "Muhammed ALRuhaily",
    email: "prog.muhammed@gmail.com",
    mobile: "+966553445533",
    displayName: "Admin Rasid System",
    platformRole: "root_admin",
  },
  {
    userId: "aalrebdi",
    password: "15001500",
    name: "Alrebdi Fahad Alrebdi",
    email: "aalrebdi@ndmo.gov.sa",
    mobile: null,
    displayName: "NDMO's president/director",
    platformRole: "director",
  },
  {
    userId: "msarhan",
    password: "15001500",
    name: "Mashal Abdullah Alsarhan",
    email: "msarhan@nic.gov.sa",
    mobile: "0555113675",
    displayName: "Vice President of NDMO",
    platformRole: "vice_president",
  },
  {
    userId: "malmoutaz",
    password: "15001500",
    name: "Manal Mohammed Almoutaz",
    email: "malmoutaz@ndmo.gov.sa",
    mobile: "0542087872",
    displayName: "Manager of Smart Rasid Platform",
    platformRole: "manager",
  },
];

async function seed() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  console.log("🔄 Seeding platform users...");
  
  for (const user of USERS) {
    const [existing] = await conn.execute(
      "SELECT id FROM platform_users WHERE userId = ?",
      [user.userId]
    );
    
    if (existing.length > 0) {
      console.log(`✅ User ${user.userId} already exists, skipping`);
      continue;
    }
    
    const hash = await bcrypt.hash(user.password, 12);
    await conn.execute(
      `INSERT INTO platform_users (userId, passwordHash, name, email, mobile, displayName, platformRole, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [user.userId, hash, user.name, user.email, user.mobile, user.displayName, user.platformRole]
    );
    console.log(`✅ Created user: ${user.userId} (${user.displayName})`);
  }
  
  console.log("✅ Seeding complete!");
  await conn.end();
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
