import express from "express"
import DiaryEntry from "../models/DiaryEntry.js"
import Recipe from "../models/Recipe.js"
import protectRoute from "../middleware/auth.middleware.js"

const router = express.Router()

// Get diary entry for a specific date
router.get("/:date", protectRoute, async (req, res) => {
  try {
    const { date } = req.params
    const queryDate = new Date(date)
    
    // Check if date is valid
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" })
    }
    
    // Set time to 00:00:00 for consistent date comparison
    queryDate.setHours(0, 0, 0, 0)
    
    const diaryEntry = await DiaryEntry.findOne({
      user: req.user._id,
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + (24 * 60 * 60 * 1000))
      }
    })

    if (!diaryEntry) {
      // Return an empty entry if none exists
      return res.json({ 
        date: queryDate,
        meals: { breakfast: null, lunch: null, dinner: null },
        water: 0
      })
    }

    res.json(diaryEntry)
  } catch (error) {
    console.log("Error fetching diary entry:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create or update diary entry
router.post("/:date", protectRoute, async (req, res) => {
  try {
    const { date } = req.params
    const { mealType, meal, water } = req.body
    
    const queryDate = new Date(date)
    
    // Check if date is valid
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" })
    }
    
    // Set time to 00:00:00 for consistent date comparison
    queryDate.setHours(0, 0, 0, 0)
    
    // Find or create diary entry
    let diaryEntry = await DiaryEntry.findOne({
      user: req.user._id,
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + (24 * 60 * 60 * 1000))
      }
    })
    
    if (!diaryEntry) {
      diaryEntry = new DiaryEntry({
        user: req.user._id,
        date: queryDate,
        meals: {
          breakfast: null,
          lunch: null,
          dinner: null
        },
        water: 0
      })
    }
    
    // Update meal if provided
    if (mealType && meal) {
      if (!["breakfast", "lunch", "dinner"].includes(mealType)) {
        return res.status(400).json({ message: "Invalid meal type" })
      }
      
      diaryEntry.meals[mealType] = meal
    }
    
    // Update water if provided
    if (water !== undefined) {
      diaryEntry.water = water
    }
    
    await diaryEntry.save()
    
    res.json(diaryEntry)
  } catch (error) {
    console.log("Error updating diary entry:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a meal from diary entry
router.delete("/:date/:mealType", protectRoute, async (req, res) => {
  try {
    const { date, mealType } = req.params
    
    if (!["breakfast", "lunch", "dinner"].includes(mealType)) {
      return res.status(400).json({ message: "Invalid meal type" })
    }
    
    const queryDate = new Date(date)
    
    // Check if date is valid
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" })
    }
    
    // Set time to 00:00:00 for consistent date comparison
    queryDate.setHours(0, 0, 0, 0)
    
    const diaryEntry = await DiaryEntry.findOne({
      user: req.user._id,
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + (24 * 60 * 60 * 1000))
      }
    })
    
    if (!diaryEntry) {
      return res.status(404).json({ message: "Diary entry not found" })
    }
    
    // Set meal to null (delete it)
    diaryEntry.meals[mealType] = null
    await diaryEntry.save()
    
    res.json({ message: `${mealType} deleted successfully` })
  } catch (error) {
    console.log("Error deleting meal:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router