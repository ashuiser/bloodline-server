import type { Request, Response } from "express";
import { getActiveActivity } from "../services/activityService.js";
import { getNearbyDonorsService } from "../services/locationService.js";
import { createBloodRequest } from "../services/requestService.js";
import { broadcastToUsers } from "../socket.js";
import { isBloodCompatible } from "../utils/bloodType.js";
import createError from "../utils/createError.utils.js";
import sendResponse from "../utils/sendResponse.utils.js";
import { createRequestSchema } from "../zod/schema.js";

export const createRequest = async (req: Request, res: Response) => {
	const userId = res.locals.user.id;

	const parseResult = createRequestSchema.safeParse(req.body);
	if (!parseResult.success) {
		throw createError({ code: "VALIDATION_ERROR", details: parseResult.error });
	}

	// Ensure the user doesn't already have an active request or donation
	const activity = await getActiveActivity(userId);
	if (activity.activeRequest || activity.activeDonation) {
		throw createError({
			code: "BAD_REQUEST",
			message: "You already have an active request or donation.",
		});
	}

	const newRequest = await createBloodRequest(userId, parseResult.data);

	// Find nearby donors (radius 50km)
	const nearby = await getNearbyDonorsService(
		parseResult.data.hospitalLng,
		parseResult.data.hospitalLat,
		50,
	);
	const targetDonors = nearby.filter(
		(d) =>
			d.bloodType &&
			isBloodCompatible(d.bloodType, parseResult.data.requiredBloodType),
	);

	const targetIds = targetDonors.map((d) => d.id).filter((id) => id !== userId);

	if (targetIds.length > 0) {
		broadcastToUsers(targetIds, "new_blood_request", {
			request: newRequest,
		});
	}

	sendResponse({
		res,
		statusCode: 201,
		success: true,
		data: { request: newRequest },
	});
};
