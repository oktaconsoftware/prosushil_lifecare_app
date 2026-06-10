import { pgTable, serial, text, timestamp, integer, decimal, boolean } from 'drizzle-orm/pg-core';

// 1. Users Table (Stores both Admins and Sales Agents)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  employeeId: text('employee_id').notNull().unique(), // e.g., 'PL-1042'
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'ADMIN' or 'AGENT'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Targets Table (Medical Shops / Pharmacies to visit)
export const targets = pgTable('targets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Visits Table (The core tracking log)
export const visits = pgTable('visits', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => users.id).notNull(),
  targetId: integer('target_id').references(() => targets.id).notNull(),
  
  // Geofencing & Proof Data
  checkInLat: decimal('check_in_lat', { precision: 10, scale: 7 }),
  checkInLng: decimal('check_in_lng', { precision: 10, scale: 7 }),
  deviationMeters: integer('deviation_meters'),
  photoUrl: text('photo_url'), // S3 Bucket link
  
  // Performance Data
  status: text('status').default('Flagged'), // 'Verified' or 'Flagged'
  dealsClosed: integer('deals_closed').default(0),
  dealVolume: integer('deal_volume').default(0),
  
  // Timestamps
  checkInTime: timestamp('check_in_time'),
  checkOutTime: timestamp('check_out_time'),
  createdAt: timestamp('created_at').defaultNow(),
});