import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config'; // Loads .env.local automatically

// Define the root admin credentials
const ROOT_ADMIN = {
  name: 'System Administrator',
  employeeId: 'PL-ADMIN', 
  password: 'AdminPassword123!', 
};

// Standard Web Crypto Hashing Function
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
  console.log('🌱 Starting database seed process...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  // Create a connection specifically for the seed script
  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    // 1. Hash the root password
    const hashedPassword = await hashPassword(ROOT_ADMIN.password);

    // 2. Insert the root admin
    console.log(`Inserting root admin user: ${ROOT_ADMIN.employeeId}...`);
    
    await db.insert(schema.users).values({
      name: ROOT_ADMIN.name,
      employeeId: ROOT_ADMIN.employeeId,
      passwordHash: hashedPassword,
      role: ROOT_ADMIN.role,
      isActive: true,
    });

    console.log('✅ Success! Root admin created.');
    console.log(`Username: ${ROOT_ADMIN.employeeId}`);
    console.log(`Password: ${ROOT_ADMIN.password}`);

  } catch (error) {
    // If the employeeId already exists, it will throw a unique constraint error (23505)
    if (error.code === '23505') {
      console.log('⚠️ Root admin already exists in the database. Seeding skipped.');
    } else {
      console.error('❌ Failed to seed database:', error);
    }
  } finally {
    // Close the connection so the script can exit
    await client.end();
    console.log('Done.');
  }
}

main();