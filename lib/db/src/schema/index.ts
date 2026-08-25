import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const vehiclesTable = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  price: integer("price").notNull(),
  mileage: integer("mileage").notNull(),
  location: text("location").notNull(),
  bodyStyle: text("body_style").notNull(),
  transmission: text("transmission").notNull(),
  engine: text("engine").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  featured: boolean("featured").notNull().default(false),
});

export const soldVehiclesTable = pgTable("sold_vehicles", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  soldDate: text("sold_date").notNull(),
  imageUrl: text("image_url").notNull(),
  location: text("location").notNull(),
});

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  vehicleSlug: text("vehicle_slug"),
  inquiryType: text("inquiry_type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});