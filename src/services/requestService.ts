import { db } from "../db/index.js";
import { requests } from "../db/schema.js";
import type { TCreateRequest } from "../zod/schema.js";

export async function createBloodRequest(userId: string, data: TCreateRequest) {
	const [newRequest] = await db
		.insert(requests)
		.values({
			requesterId: userId,
			hospitalName: data.hospitalName,
			hospitalLat: data.hospitalLat,
			hospitalLng: data.hospitalLng,
			requiredBloodType: data.requiredBloodType,
			unitsRequired: data.unitsRequired,
			status: "pending",
		})
		.returning();

	return newRequest;
}
