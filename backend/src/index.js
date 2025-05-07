import express from "express"
import cors from "cors"
import "dotenv/config"
import authRoutes from "./routes/authRoutes.js"
import recipesRoutes from "./routes/recipesRoutes.js"
import bookmarkRoutes from "./routes/bookmarkRoutes.js"
import diaryRoutes from "./routes/diaryRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"
import todoListRoutes from "./routes/todoListRoutes.js"
import morgan from "morgan" 
import { connectDB } from "./lib/db.js"
import job from "./lib/cron.js"


job.start()
const app = express()
const PORT = process.env.PORT || 4000

// Request logging middleware
app.use(morgan('dev'))

// Handle text/plain requests - parse them as JSON
app.use(express.text({ type: 'text/plain', limit: '10mb' }));
app.use((req, res, next) => {
  if (req.is('text/plain') && req.body) {
    try {
      req.body = JSON.parse(req.body);
      console.log('Successfully parsed text/plain as JSON:', req.body);
    } catch (e) {
      console.error('Error parsing text/plain as JSON:', e, 'Raw body:', req.body);
    }
  }
  next();
});

// Standard body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// CORS middleware
app.use(cors())

// Root route handler
app.get("/", (req, res) => {
  res.send("MyCookbook API server. Please use /api/... endpoints to access the API.");
});

// API root route
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to MyCookbook API",
    version: "1.0.0",
    endpoints: [
      "/api/auth - Authentication endpoints",
      "/api/recipes - Recipe management",
      "/api/bookmarks - Bookmark functionality",
      "/api/diary - Diary entries",
      "/api/ai - AI-powered features",
      "/api/todolists - Todo list management"
    ]
  });
});

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/recipes", recipesRoutes)
app.use("/api/bookmarks", bookmarkRoutes)
app.use("/api/diary", diaryRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/todolists", todoListRoutes)

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err)
  res.status(500).json({ message: "Internal server error", error: err.message })
})

// 404 handler - should be after all other routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  connectDB()
})