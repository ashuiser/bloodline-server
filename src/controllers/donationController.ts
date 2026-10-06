import type { Request, Response } from "express";
import { getActiveActivity } from "../services/activityService.js";
import { acceptBloodRequest } from "../services/donationService.js";
import createError from "../utils/createError.utils.js";
import sendResponse from "../utils/sendResponse.utils.js";
import { acceptDonationSchema } from "../zod/schema.js";

export const acceptDonation = async (req: Request, res: Response) => {
	const userId = res.locals.user.id;
	const parseResult = acceptDonationSchema.safeParse(req.params);
	if (!parseResult.success) {
		throw createError({ code: "VALIDATION_ERROR", details: parseResult.error });
	}
	const { requestId } = parseResult.data;

	// Ensure the user doesn't already have an active request or donation
	const activity = await getActiveActivity(userId);
	if (activity.activeRequest || activity.activeDonation) {
		throw createError({
			code: "BAD_REQUEST",
			message: "You already have an active request or donation.",
		});
	}

	try {
		const newDonation = await acceptBloodRequest(userId, requestId);

		// TODO: Emit socket event to the requester that a donor accepted

		sendResponse({
			res,
			statusCode: 200,
			success: true,
			data: { donation: newDonation },
		});
	} catch (err) {
		throw createError({
			code: "BAD_REQUEST",
			message: err instanceof Error ? err.message : undefined,
		});
	}
};
