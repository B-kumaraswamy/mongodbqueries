import express from "express";
import cors from "cors"
import mongoose from "mongoose";
import userController from "./routes/userController.js";
import queryRouter from "./routes/queries.js";

import dotenv from "dotenv"

dotenv.config()

const port  = 8080 

const app = express()

app.use(express.json())

app.use(cors())

app.use("/database", userController)

app.use('/queries', queryRouter)

app.listen(port, () => {
    console.log("connected to port 8080")
})

mongoose.connect(process.env.DB_URL).then(() => console.log("connected to mongoose db"))