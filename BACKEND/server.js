 
import express from "express";
import landscapeRoute from "./Routes/landscapeRoute.js";
import progressRoute from "./Routes/progressRoute.js";
import customerRoute from "./Routes/customerRoute.js";
import landscaperRoute from "./Routes/landscaperRoute.js";
import appointmentRoute from "./Routes/appointmentRoute.js";
import { connectDB } from "./Config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

dotenv.config(); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();


app.use(express.json());
app.use(cors());  
app.use("/uploads", express.static('uploads'));  

app.use("/api/landscape", landscapeRoute);
app.use("/api/progress", progressRoute);
app.use("/api/customer", customerRoute);
app.use("/api/landscaper", landscaperRoute);
app.use("/api/appointments", appointmentRoute);


app.listen(PORT, () => {
  console.log("Server started on port: ", PORT);
});