import { pgTable, text, serial, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'vet']);
export const animalStatusEnum = pgEnum('animal_status', ['available', 'adoptable', 'pending', 'adopted', 'treatment', 'critical', 'recovering']);
export const animalSpeciesEnum = pgEnum('animal_species', ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'other']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'rejected']);
export const reportStatusEnum = pgEnum('report_status', ['new', 'processing', 'completed']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('user'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  adoptionRequests: many(adoptionRequests),
  rescueReports: many(rescueReports),
}));

// Animals
export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: animalSpeciesEnum("species").notNull(),
  breed: text("breed").notNull(),
  age: integer("age").notNull(),
  photoUrl: text("photo_url").notNull(),
  description: text("description").notNull(),
  status: animalStatusEnum("status").notNull().default('available'),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const animalsRelations = relations(animals, ({ many }) => ({
  adoptionRequests: many(adoptionRequests),
  rescueReports: many(rescueReports),
  treatmentRecords: many(treatmentRecords),
}));

// Adoption Requests
export const adoptionRequests = pgTable("adoption_requests", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull().references(() => animals.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  status: requestStatusEnum("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adoptionRequestsRelations = relations(adoptionRequests, ({ one }) => ({
  animal: one(animals, {
    fields: [adoptionRequests.animalId],
    references: [animals.id],
  }),
  user: one(users, {
    fields: [adoptionRequests.userId],
    references: [users.id],
  }),
}));

// Rescue Reports
export const rescueReports = pgTable("rescue_reports", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull().references(() => animals.id),
  reporterId: integer("reporter_id").notNull().references(() => users.id),
  status: reportStatusEnum("status").notNull().default('new'),
  notes: text("notes").notNull(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rescueReportsRelations = relations(rescueReports, ({ one }) => ({
  animal: one(animals, {
    fields: [rescueReports.animalId],
    references: [animals.id],
  }),
  reporter: one(users, {
    fields: [rescueReports.reporterId],
    references: [users.id],
  }),
}));

// Treatment Records
export const treatmentRecords = pgTable("treatment_records", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull().references(() => animals.id),
  vetName: text("vet_name").notNull(),
  notes: text("notes").notNull(),
  date: timestamp("date").defaultNow(),
});

export const treatmentRecordsRelations = relations(treatmentRecords, ({ one }) => ({
  animal: one(animals, {
    fields: [treatmentRecords.animalId],
    references: [animals.id],
  }),
}));

// Insert schemas for Zod validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAnimalSchema = z.object({
  name: z.string().min(2),
  species: z.string().min(2),
  breed: z.string().min(2),
  age: z.number().min(0),
  photoUrl: z.string().url(),
  description: z.string().min(10),
  status: z.enum([
    'available',
    'adoptable',
    'pending',
    'adopted',
    'treatment',
    'critical',
    'recovering'
  ]),
  location: z.string().min(5)
});
export const insertAdoptionRequestSchema = createInsertSchema(adoptionRequests).omit({ id: true, createdAt: true });
export const insertRescueReportSchema = createInsertSchema(rescueReports).omit({ id: true, createdAt: true });
export const insertTreatmentRecordSchema = createInsertSchema(treatmentRecords).omit({ id: true });

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export type Animal = typeof animals.$inferSelect;
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;

export type AdoptionRequest = typeof adoptionRequests.$inferSelect;
export type InsertAdoptionRequest = z.infer<typeof insertAdoptionRequestSchema>;

export type RescueReport = typeof rescueReports.$inferSelect;
export type InsertRescueReport = z.infer<typeof insertRescueReportSchema>;

export type TreatmentRecord = typeof treatmentRecords.$inferSelect;
export type InsertTreatmentRecord = z.infer<typeof insertTreatmentRecordSchema>;

// Treatment Records Schema for MongoDB
export const treatmentRecordSchema = z.object({
  animalId: z.string(),
  vetId: z.string(),
  diagnosis: z.string().min(10, {
    message: "Diagnosis must be at least 10 characters.",
  }),
  treatment: z.string().min(10, {
    message: "Treatment description must be at least 10 characters.",
  }),
  date: z.date().optional(),
});

// Removed duplicate type alias for TreatmentRecord to fix TS2300 error.
// Use only the relational type below:
// export type TreatmentRecord = z.infer<typeof treatmentRecordSchema> & { id: string }; // <-- removed this line
