import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { loginUser, signupUser } from "../services/authService.js";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies.utils.js";
import createError from "../utils/createError.utils.js";
import sendResponse from "../utils/sendResponse.utils.js";
import { loginSchema, signupSchema } from "../zod/schema.js";

export async function signup(req: Request, res: Response) {
	const parseResult = signupSchema.safeParse(req.body);
	if (!parseResult.success) {
		throw createError({ code: "VALIDATION_ERROR", details: parseResult.error });
	}
	const { accessToken, refreshToken, user } = await signupUser(
		parseResult.data,
	);
	setAuthCookies(res, accessToken, refreshToken);
	sendResponse({ res, statusCode: 200, success: true, data: { user } });
}

export async function login(req: Request, res: Response) {
	const parseResult = loginSchema.safeParse(req.body);
	if (!parseResult.success) {
		throw createError({ code: "VALIDATION_ERROR", details: parseResult.error });
	}
	const { accessToken, refreshToken, user } = await loginUser(parseResult.data);
	setAuthCookies(res, accessToken, refreshToken);
	sendResponse({ res, statusCode: 200, success: true, data: { user } });
}

export async function logout(_req: Request, res: Response) {
	clearAuthCookies(res);
	sendResponse({
		res,
		statusCode: 200,
		success: true,
		data: { message: "Logged out successfully" },
	});
}

export async function getMe(_req: Request, res: Response) {
	const userId = res.locals.user.id;

	const [user] = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			bloodType: users.bloodType,
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) throw createError({ code: "USER_NOT_FOUND" });

	sendResponse({ res, statusCode: 200, success: true, data: { user } });
}
