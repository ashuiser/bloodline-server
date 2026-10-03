import z from "zod";

export const reqEnvVarsSchema = z.object({
	PORT: z.coerce.number(),
	DATABASE_URL: z.url(),
	REDIS_URL: z.url(),
	JWT_SECRET: z.string(),
});

export const BloodTypes = [
	"A+",
	"A-",
	"B+",
	"B-",
	"AB+",
	"AB-",
	"O+",
	"O-",
] as const;
export type TBloodType = (typeof BloodTypes)[number];

export const signupSchema = z.object({
	name: z.string().min(2),
	email: z.email(),
	phone: z.string().min(10),
	bloodType: z.enum(BloodTypes),
	dob: z.coerce.date().max(
		new Date(new Date().setFullYear(new Date().getFullYear() - 15)),
		{ message: "You must be at least 15 years old" }
	),
	password: z.string().min(8),
});
export type TSignup = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});
export type TLogin = z.infer<typeof loginSchema>;

export const locationSchema = z.object({
	lng: z.coerce.number(),
	lat: z.coerce.number(),
	radius: z.coerce.number().optional().default(50),
});
export type TLocation = z.infer<typeof locationSchema>;
