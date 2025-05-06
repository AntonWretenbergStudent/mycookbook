import express from "express"
import User from "../models/User.js"
import jwt from "jsonwebtoken"

const router = express.Router()

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" })
}

// Debug middleware specifically for auth routes
router.use((req, res, next) => {
  console.log('Auth route request:')
  console.log('- Path:', req.path)
  console.log('- Method:', req.method)
  console.log('- Content-Type:', req.headers['content-type'])
  console.log('- Body:', JSON.stringify(req.body))
  next()
})

router.post("/register", async (req, res, next) => {
  try {
    // Check if req.body exists
    if (!req.body) {
      console.error('Request body is undefined')
      return res.status(400).json({ message: "No request body received" })
    }
    
    // Safely extract fields with defaults
    const email = req.body.email || ''
    const username = req.body.username || ''
    const password = req.body.password || ''
    
    console.log('Registration attempt:', { email, username, password: password ? '[REDACTED]' : 'missing' })

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be at least 6 characters long" })
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username should be at least 3 characters long" })
    }

    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" })
    }

    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" })
    }

    const profileImage = `https://api.dicebear.com/9.x/initials/svg?seed=${username}`

    const user = new User({
      email,
      username,
      password,
      profileImage,
    })

    await user.save()

    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    })
  } catch (error) {
    console.error("Error in register route:", error)
    // Pass to global error handler
    next(error)
  }
})

router.post("/login", async (req, res, next) => {
  try {
    // Check if req.body exists
    if (!req.body) {
      console.error('Request body is undefined in login')
      return res.status(400).json({ message: "No request body received" })
    }
    
    const email = req.body.email || ''
    const password = req.body.password || ''
    
    console.log('Login attempt:', { email, password: password ? '[REDACTED]' : 'missing' })

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" })

    // check if user exist
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: "Invalid credentials" })

    // check if password is correct
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" })

    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    })
  } catch (error) {
    console.error("Error in login route:", error)
    next(error)
  }
})

export default router