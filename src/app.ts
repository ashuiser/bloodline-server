import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { getMe, login, logout, signup } from "./controllers/authController.js";
import { getNearby } from "./controllers/locationController.js";
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
app.get("/api/location/nearby", requireAuth, getNearby);

app.get("/healthy", (_req, res) => {
	res.status(200).json({
		message: "Hello from server",
		status: "success",
	});
});

app.use(errorHandler);

export default app;
