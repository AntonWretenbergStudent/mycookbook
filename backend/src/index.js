import express from "express"
import cors from "cors"
import "dotenv/config"
import authRoutes from "./routes/authRoutes.js"
import recipesRoutes from "./routes/recipesRoutes.js"

import { connectDB } from "./lib/db.js"

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use(cors())

app.use("/api/auth", authRoutes)
app.use("/api/recipes", recipesRoutes)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB()
})