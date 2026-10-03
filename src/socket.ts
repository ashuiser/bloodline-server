import { parseCookie } from "cookie";
import jwt from "jsonwebtoken";
import type { Server } from "socket.io";
import { env } from "./config/env.js";
import { getNearbyDonors, updateLocation } from "./services/locationService.js";

const JWT_SECRET = env.JWT_SECRET;

export function setupSockets(io: Server) {
	// Authentication middleware
	io.use((socket, next) => {
		const cookies = parseCookie(socket.handshake.headers.cookie || "");
		const token = cookies.accessToken || cookies.refreshToken;

		if (!token) {
			return next(new Error("Authentication error"));
		}

		try {
			const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
			socket.data.userId = decoded.userId;
			next();
		} catch {
			next(new Error("Authentication error"));
		}
	});

	io.on("connection", (socket) => {
		const userId = socket.data.userId;
		console.log(`Socket connected: ${userId} (${socket.id})`);

		socket.on("updateLocation", async ({ lng, lat }) => {
			if (typeof lng !== "number" || typeof lat !== "number") return;
			try {
				await updateLocation(userId, lng, lat);

				// Fetch nearby donors and broadcast them to this user
				const nearby = await getNearbyDonors(lng, lat, 10);
				socket.emit("nearbyDonors", nearby);
			} catch (err) {
				console.error("Redis geo error:", err);
			}
		});

		socket.on("disconnect", () => {
			console.log(`Socket disconnected: ${userId}`);
		});
	});
}
