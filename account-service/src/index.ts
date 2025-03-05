import "reflect-metadata";
import express from "express";
import authRoutes from "./routes/authRoutes";
import { initializeDatabase } from "./config/database";

const app = express();
app.use(express.json());
app.use("/account", authRoutes);

initializeDatabase()
    .then(() => {
        app.listen(3001, () => console.log("Account Service running on port 3001"));
    })
    .catch((error: Error) => {
        console.error("Database connection error:", error.message);
    });