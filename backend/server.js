import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./lib/db.js"

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () =>{
    console.log("server in running on port " + PORT);
    connectDB();
});


//UySjtW2fLNr7v3mH