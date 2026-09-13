import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import dns from "dns";
import adminRoutes from "./routes/adminRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import { seedAdminUser } from "./controllers/adminController.js";

// DNS configuration for MongoDB SRV connection
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  "https://moveohealth.vercel.app",
  "https://moveohealth.vercel.app/",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
];
const allowedorgi = allowedOrigins;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(origin + "/") ||
        allowedOrigins.includes(origin.replace(/\/$/, ""))
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/submissions", submissionRoutes);

// Connect MongoDB before starting server
try {
  await connectDB();
  await seedAdminUser();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("MongoDB connection failed:", error);
  process.exit(1);
}