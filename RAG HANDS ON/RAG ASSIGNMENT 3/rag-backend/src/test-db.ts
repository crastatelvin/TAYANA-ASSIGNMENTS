import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
    try {
        console.log("Attempting to connect to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("SUCCESS: Connected to MongoDB Atlas");
        process.exit(0);
    } catch (error) {
        console.error("FAILURE: Connection Error", error);
        process.exit(1);
    }
};

testConnection();
