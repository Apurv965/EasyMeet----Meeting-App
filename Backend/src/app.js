import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);
const defaultMongoUri = "mongodb://127.0.0.1:27017/easymeet";
const mongoUri = process.env.MONGO_URI || defaultMongoUri;
const host = process.env.HOST || "127.0.0.1";

app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

mongoose.set("bufferCommands", false);

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        databaseConnected: isDatabaseConnected()
    });
});

app.use("/api/v1/users", (req, res, next) => {
    if (!isDatabaseConnected()) {
        return res.status(503).json({
            message: "Database unavailable. Check MONGO_URI and MongoDB connectivity."
        });
    }

    next();
}, userRoutes);

// app.get("/home", (req, res) => {
//     return res.json({"hello": "world"})
// });

const connectDatabase = async() => {
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Failed to connect to MongoDB.");
        console.error("Set MONGO_URI in Backend/.env and verify MongoDB connectivity.");
        console.error(error);
    }
};

mongoose.connection.on("disconnected", () => {
    console.error("MongoDB disconnected.");
});

mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

const start = async() => {
    server.on("error", (error) => {
        console.error(`Failed to start server on ${host}:${app.get("port")}.`);
        console.error(error);
    });

    server.listen(app.get("port"), host, () => {
        console.log(`Listening on http://${host}:${app.get("port")}`);
    });

    await connectDatabase();
}

start();
