import { pgTable, serial, text, timestamp, integer, decimal, boolean , varchar , date
  , numeric
 } from 'drizzle-orm/pg-core';

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

export const visits = pgTable('visits', {
  id: serial('id').primaryKey(),
  agentId: varchar('agent_id').notNull(),
  medicalShopId: integer('medical_shop_id').references(() => medicalShops.id).notNull(),
  photoUrl: text('photo_url'),
  orderAmount: numeric('order_amount').notNull().default('0'),
  collectionAmount: numeric('collection_amount').notNull().default('0'),
  remark: text('remark'),
  createdAt: timestamp('created_at').defaultNow(),
  status: varchar('status').notNull().default('Pending Review'),
});


export const routeAssignments = pgTable('route_assignments', {
  id: serial('id').primaryKey(),
  agentId: varchar('agent_id').notNull(),
  targetId: integer('target_id').notNull(), 
});

// ==== Phase 2 Chagges--

export const areas = pgTable('areas', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const places = pgTable('places', {
  id: serial('id').primaryKey(),
  areaId: integer('area_id').references(() => areas.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const medicalShops = pgTable('medical_shops', {
  id: serial('id').primaryKey(),
  placeId: integer('place_id').references(() => places.id), // Links the medical shop to the place
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
});