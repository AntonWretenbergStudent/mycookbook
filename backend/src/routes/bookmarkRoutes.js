import express from "express"
import Bookmark from "../models/Bookmark.js"
import Recipe from "../models/Recipe.js"
import protectRoute from "../middleware/auth.middleware.js"

const router = express.Router()

// Get all bookmarks for the current user
router.get("/", protectRoute, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: "recipe",
        populate: {
          path: "user",
          select: "username profileImage"
        }
      })
      .sort({ createdAt: -1 })

    // Format the response to match the recipe structure
    const formattedBookmarks = bookmarks.map(bookmark => bookmark.recipe)
    
    res.json(formattedBookmarks)
  } catch (error) {
    console.log("Error getting bookmarks", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add a bookmark
router.post("/", protectRoute, async (req, res) => {
  try {
    const { recipeId } = req.body

    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID is required" })
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId)
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" })
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      user: req.user._id,
      recipe: recipeId
    })

    if (existingBookmark) {
      return res.status(400).json({ message: "Recipe already bookmarked" })
    }

    // Create new bookmark
    const newBookmark = new Bookmark({
      user: req.user._id,
      recipe: recipeId
    })

    await newBookmark.save()

    res.status(201).json({ message: "Recipe bookmarked successfully" })
  } catch (error) {
    console.log("Error adding bookmark", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Remove a bookmark
router.delete("/:recipeId", protectRoute, async (req, res) => {
  try {
    const { recipeId } = req.params

    const bookmark = await Bookmark.findOne({
      user: req.user._id,
      recipe: recipeId
    })

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" })
    }

    await bookmark.deleteOne()

    res.json({ message: "Bookmark removed successfully" })
  } catch (error) {
    console.log("Error removing bookmark", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/check/:recipeId", protectRoute, async (req, res) => {
  try {
    const { recipeId } = req.params

    const bookmark = await Bookmark.findOne({
      user: req.user._id,
      recipe: recipeId
    })

    res.json({ isBookmarked: !!bookmark })
  } catch (error) {
    console.log("Error checking bookmark", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router