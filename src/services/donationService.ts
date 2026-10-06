import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { donations, requests } from "../db/schema.js";

export async function acceptBloodRequest(userId: string, requestId: string) {
	return await db.transaction(async (tx) => {
		// 1. Check if request exists and needs units
		const [request] = await tx
			.select()
			.from(requests)
			.where(eq(requests.id, requestId))
			.limit(1);

		if (!request) {
			throw new Error("Request not found");
		}
		if (request.status !== "active" && request.status !== "pending") {
			throw new Error("Request is no longer active");
		}
		if (request.unitsAccepted >= request.unitsRequired) {
			throw new Error("Request has already fulfilled its required units");
		}

		// 2. Make sure user hasn't already accepted this request
		const [existingDonation] = await tx
			.select()
			.from(donations)
			.where(
				and(eq(donations.requestId, requestId), eq(donations.donorId, userId)),
			)
			.limit(1);

		if (existingDonation) {
			throw new Error("You have already accepted this request");
		}

		// 3. Create the donation record
		const [newDonation] = await tx
			.insert(donations)
			.values({
				requestId,
				donorId: userId,
				status: "accepted",
			})
			.returning();

		// 4. Update the request's unitsAccepted
		await tx
			.update(requests)
			.set({
				unitsAccepted: sql`${requests.unitsAccepted} + 1`,
				status: sql`CASE WHEN ${requests.unitsAccepted} + 1 >= ${requests.unitsRequired} THEN 'completed'::request_status ELSE 'active'::request_status END`,
			})
			.where(eq(requests.id, requestId));

		return newDonation;
	});
}
