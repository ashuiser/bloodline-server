import { inArray } from "drizzle-orm";
import redisClient from "../config/redis.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const GEO_KEY = "donors_location";

export const updateLocation = async (
	userId: string,
	lng: number,
	lat: number,
) => {
	await redisClient.geoAdd(GEO_KEY, {
		longitude: lng,
		latitude: lat,
		member: userId,
	});
};

export const getNearbyDonorsService = async (
	lng: number,
	lat: number,
	radiusKm: number = 50,
	userId: string,
) => {
	const geoResults = await redisClient.geoSearchWith(
		GEO_KEY,
		{ longitude: lng, latitude: lat },
		{ radius: radiusKm, unit: "km" },
		["WITHCOORD"],
	);

	if (geoResults.length === 0) return [];

	const userIds = geoResults.map((r) => r.member).filter((id) => id !== userId);

	const usersData = await db
		.select({
			id: users.id,
			bloodType: users.bloodType,
		})
		.from(users)
		.where(inArray(users.id, userIds));

	return geoResults
		.map((geo) => {
			if (!geo.coordinates) return null;
			const user = usersData.find((u) => u.id === geo.member);
			return {
				id: geo.member,
				lat: geo.coordinates.latitude,
				lng: geo.coordinates.longitude,
				bloodType: user?.bloodType || "Unknown",
			};
		})
		.filter((d) => d !== null && d.bloodType !== "Unknown")
		.slice(0, 100);
};
