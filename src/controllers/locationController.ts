import type { Request, Response } from "express";
import { getNearbyDonorsService } from "../services/locationService.js";
import createError from "../utils/createError.utils.js";
import sendResponse from "../utils/sendResponse.utils.js";
import {
	locationForDonorsSchema,
	locationForHospitalsSchema,
} from "../zod/schema.js";

export const getNearbyDonors = async (req: Request, res: Response) => {
	const userId = res.locals.user.id;
	const parseResult = locationForDonorsSchema.safeParse(req.query);
	if (!parseResult.success) {
		throw createError({
			code: "VALIDATION_ERROR",
			message: "Invalid location coordinates",
		});
	}

	const { lng, lat, radius } = parseResult.data;

	const donors = await getNearbyDonorsService(lng, lat, radius, userId);

	sendResponse({ res, statusCode: 200, success: true, data: donors });
};

export const getNearbyHospitals = async (req: Request, res: Response) => {
	const parseResult = locationForHospitalsSchema.safeParse(req.query);
	if (!parseResult.success) {
		throw createError({
			code: "VALIDATION_ERROR",
			message: "Invalid location coordinates",
		});
	}
	const radius = 50;
	const { lng, lat } = parseResult.data;

	const hospitals = await getNearbyHospitalsService(lng, lat, radius);

	sendResponse({ res, statusCode: 200, success: true, data: hospitals });
};
