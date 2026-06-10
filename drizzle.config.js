import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Explicitly tell Drizzle to read the .env.local file
config({ path: '.env.local' });

export default defineConfig({
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql', 
  dbCredentials: {
    url: process.env.DATABASE_URL, 
  },
});