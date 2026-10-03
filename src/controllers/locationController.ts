import type { NextFunction, Request, Response } from "express";
import { getNearbyDonors } from "../services/locationService.js";
import createError from "../utils/createError.utils.js";
import sendResponse from "../utils/sendResponse.utils.js";
import { locationSchema } from "../zod/schema.js";

export const getNearby = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const parseResult = locationSchema.safeParse(req.query);
		if (!parseResult.success) {
			throw createError({
				code: "VALIDATION_ERROR",
				message: "Invalid location coordinates",
			});
		}

		const { lng, lat, radius } = parseResult.data;

		const donors = await getNearbyDonors(lng, lat, radius);

		sendResponse({ res, statusCode: 200, success: true, data: donors });
	} catch (error) {
		next(error);
	}
};
