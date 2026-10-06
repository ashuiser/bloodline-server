import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { getMyActivity } from "./controllers/activityController.js";
import { getMe, login, logout, signup } from "./controllers/authController.js";
import { acceptDonation } from "./controllers/donationController.js";
import {
	getNearbyDonors,
	getNearbyHospitals,
} from "./controllers/locationController.js";
import { createRequest } from "./controllers/requestController.js";
import { requireAuth } from "./middlewares/authMiddleware.js";
import errorHandler from "./utils/errorHandler.utils.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Auth Routes
app.post("/api/auth/signup", signup);
app.post("/api/auth/login", login);
app.post("/api/auth/logout", logout);
app.get("/api/auth/me", requireAuth, getMe);

// Location Routes
app.get("/api/location/nearby", requireAuth, getNearbyDonors);
app.get("/api/location/hospitals", requireAuth, getNearbyHospitals);

// Activity Routes
app.get("/api/me/active-activity", requireAuth, getMyActivity);

// Request Routes
app.post("/api/requests", requireAuth, createRequest);

// Donation Routes
app.post("/api/donations/:requestId/accept", requireAuth, acceptDonation);

app.get("/healthy", (_req, res) => {
	res.status(200).json({
		message: "Hello from server",
		status: "success",
	});
});

app.use(errorHandler);

export default app;
