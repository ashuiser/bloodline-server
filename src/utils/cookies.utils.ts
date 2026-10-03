import type { Response } from "express";

export function setAuthCookies(res: Response, accessToken: string, refreshToken?: string) {
	// 15 minutes for access token
	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge: 15 * 60 * 1000, 
	});
	
	// 7 days for refresh token
	if (refreshToken) {
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			maxAge: 7 * 24 * 60 * 60 * 1000, 
		});
	}
}

export function clearAuthCookies(res: Response) {
	res.clearCookie("accessToken");
	res.clearCookie("refreshToken");
}
