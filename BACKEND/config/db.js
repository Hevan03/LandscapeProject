//ipBXOa2Pierm80U0
//mongodb+srv://inventoryManager:<db_password>@cluster0.q44wm5o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

import mongoose from "mongoose"
export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully")

    }catch(err){
        console.error("Database connection failed:", err);
        process.exit(1); // Exit process with failure
    }
}

