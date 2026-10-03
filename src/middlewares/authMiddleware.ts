import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { setAuthCookies } from "../utils/cookies.utils.js";
import createError from "../utils/createError.utils.js";

const JWT_SECRET = env.JWT_SECRET;

export async function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		// console.log(req.cookies);
		const accessToken = req.cookies?.accessToken;
		if (accessToken) {
			try {
				const decoded = jwt.verify(accessToken, JWT_SECRET) as {
					userId: string;
				};
				res.locals.user = { id: decoded.userId };
				return next();
			} catch (err) {
				if (!(err instanceof jwt.TokenExpiredError)) {
					throw createError({
						code: "UNAUTHORIZED",
						message: "Invalid access token",
					});
				}
			}
		}

		const refreshToken = req.cookies?.refreshToken;
		if (!refreshToken) {
			throw createError({
				code: "UNAUTHORIZED",
				message: "Authentication required",
			});
		}

		try {
			// Verify refresh token
			const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
				userId: string;
			};

			// Issue a new access token
			const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, {
				expiresIn: "15m",
			});
			const newRefreshToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, {
				expiresIn: "7d",
			});

			// Update the access token cookie
			setAuthCookies(res, newAccessToken, newRefreshToken);

			res.locals.user = { id: decoded.userId };
			return next();
		} catch (_err) {
			throw createError({
				code: "UNAUTHORIZED",
				message: "Invalid or expired session",
			});
		}
	} catch (error) {
		next(error);
	}
}
