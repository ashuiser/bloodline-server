import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import createError from "../utils/createError.utils.js";
import type { TLogin, TSignup } from "../zod/schema.js";

const JWT_SECRET = env.JWT_SECRET || "supersecret";

export async function signupUser(data: TSignup) {
	const existing = await db
		.select()
		.from(users)
		.where(eq(users.email, data.email))
		.limit(1);
	if (existing.length > 0)
		throw createError({ code: "CONFLICT", message: "Email already in use" });

	const passwordHash = await argon2.hash(data.password);

	data.dob.setUTCHours(0, 0, 0, 0);
	const dobString = data.dob.toISOString();

	const [newUser] = await db
		.insert(users)
		.values({
			name: data.name,
			email: data.email,
			phone: data.phone,
			bloodType: data.bloodType,
			dob: dobString,
			passwordHash,
		})
		.returning();

	if (!newUser) throw createError({ code: "FAILED_TO_CREATE" });

	return generateTokens(newUser);
}

export async function loginUser(data: TLogin) {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.email, data.email))
		.limit(1);
	if (!user)
		throw createError({ code: "UNAUTHORIZED", message: "Invalid credentials" });

	const valid = await argon2.verify(user.passwordHash, data.password);
	if (!valid)
		throw createError({ code: "UNAUTHORIZED", message: "Invalid credentials" });

	return generateTokens(user);
}

type TokenUser = {
	id: string;
	name: string;
	email: string;
	bloodType: string;
};

function generateTokens(user: TokenUser) {
	const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
		expiresIn: "15m",
	});
	const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
		expiresIn: "7d",
	});

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			bloodType: user.bloodType,
		},
		accessToken,
		refreshToken,
	};
}
