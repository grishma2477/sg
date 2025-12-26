import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import fileUpload from "express-fileupload"


dotenv.config()
const app = express(); 
app.use(cors());
app.use(express.json())
//  to create and store temporary folder for user uploaded images
app.use(fileUpload({useTempFiles:true}))


//routes import here
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";


app.get("/",(req,res)=>{
    res.status(200).send("Welcome to PERN API")
})

// routes use here.
app.use("/auth",authRoutes);
app.use("/user", userRoutes);

//custom middleware
app.use(errorHandler);

export default app