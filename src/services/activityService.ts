import { and, eq, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { donations, requests } from "../db/schema.js";

export async function getActiveActivity(userId: string) {
	// Find active request by user
	const [activeRequest] = await db
		.select()
		.from(requests)
		.where(
			and(
				eq(requests.requesterId, userId),
				or(eq(requests.status, "pending"), eq(requests.status, "active")),
			),
		)
		.limit(1);

	// Find active donation by user
	const [activeDonation] = await db
		.select()
		.from(donations)
		.where(
			and(
				eq(donations.donorId, userId),
				or(eq(donations.status, "accepted"), eq(donations.status, "en_route")),
			),
		)
		.limit(1);

	return {
		activeRequest: activeRequest || null,
		activeDonation: activeDonation || null,
	};
}
