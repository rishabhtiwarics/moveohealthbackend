import mongoose from "mongoose";

export default async function connectDB() {
    const mongoUri = process.env.MONGO_URI?.trim();

    if (!mongoUri) {
        console.error("Error connecting to MongoDB: MONGO_URI is not set");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
}
