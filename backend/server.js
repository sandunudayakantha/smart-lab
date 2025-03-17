import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import {connectDB} from "./lib/db.js"

import testTemplateRoutes from "./routes/testTemplate.route.js"
import testReportRoutes from "./routes/testReport.route.js"


dotenv.config();

const app = express();



const PORT = process.env.PORT || 5001;

app.use(express.json()) //allows to parse thr body of req

app.use(cors())




app.use("/api/testTemplates",testTemplateRoutes)

app.use("/api/testReports",testReportRoutes)

app.get('/',(req,res)=>{
    res.send('api working huto')
})



app.listen(PORT, () =>{
    console.log("server in running on port " + PORT);
    connectDB();
});


//UySjtW2fLNr7v3mH