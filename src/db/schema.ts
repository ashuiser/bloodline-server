import { sql } from "drizzle-orm";
import {
	check,
	date,
	doublePrecision,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const requestStatusEnum = pgEnum("request_status", [
	"pending",
	"active",
	"completed",
	"cancelled",
]);
export const donationStatusEnum = pgEnum("donation_status", [
	"accepted",
	"en_route",
	"completed",
	"cancelled",
]);
export const bloodTypeEnum = pgEnum("blood_type", [
	"A+",
	"A-",
	"B+",
	"B-",
	"AB+",
	"AB-",
	"O+",
	"O-",
]);

export const users = pgTable("users", {
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull(),
	email: text().unique().notNull(),
	phone: text().notNull(),
	bloodType: bloodTypeEnum("blood_type").notNull(),
	dob: date().notNull(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
	return {
		ageCheck: check("age_check", sql`${table.dob} <= CURRENT_DATE - INTERVAL '15 years'`),
	};
});

export const requests = pgTable("requests", {
	id: uuid().primaryKey().defaultRandom(),
	requesterId: uuid("requester_id")
		.references(() => users.id)
		.notNull(),
	hospitalName: text("hospital_name").notNull(),
	hospitalLat: doublePrecision("hospital_lat").notNull(),
	hospitalLng: doublePrecision("hospital_lng").notNull(),
	requiredBloodType: text("required_blood_type").notNull(),
	unitsRequired: integer("units_required").notNull(),
	unitsAccepted: integer("units_accepted").default(0).notNull(),
	status: requestStatusEnum().default("active").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const donations = pgTable("donations", {
	id: uuid().primaryKey().defaultRandom(),
	requestId: uuid("request_id")
		.references(() => requests.id)
		.notNull(),
	donorId: uuid("donor_id")
		.references(() => users.id)
		.notNull(),
	status: donationStatusEnum().default("accepted").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
