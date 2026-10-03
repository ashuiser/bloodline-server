import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import redisClient from "./config/redis.js";
import { setupSockets } from "./socket.js";

try {
	await redisClient.connect();
	console.log("Redis client connected");
} catch (error) {
	console.log("Redis client connection error", error);
	process.exit(1);
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: { origin: true, credentials: true },
});

// Setup WebSocket logic
setupSockets(io);

const PORT = env.PORT || 4000;
httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
