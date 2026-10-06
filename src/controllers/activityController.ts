import type { Request, Response } from "express";
import { getActiveActivity } from "../services/activityService.js";
import sendResponse from "../utils/sendResponse.utils.js";

export const getMyActivity = async (_req: Request, res: Response) => {
	const userId = res.locals.user.id;
	const activity = await getActiveActivity(userId);

	sendResponse({
		res,
		statusCode: 200,
		success: true,
		data: activity,
	});
};
