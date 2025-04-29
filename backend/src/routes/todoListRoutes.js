import express from "express"
import TodoList from "../models/TodoList.js"
import protectRoute from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protectRoute, async (req, res) => {
  try {
    const todoLists = await TodoList.find({ user: req.user._id })
      .sort({ createdAt: -1 })
    
    res.json(todoLists)
  } catch (error) {
    console.log("Error getting todo lists", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/:id", protectRoute, async (req, res) => {
  try {
    const todoList = await TodoList.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    
    if (!todoList) {
      return res.status(404).json({ message: "Todo list not found" })
    }
    
    res.json(todoList)
  } catch (error) {
    console.log("Error getting todo list", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, tasks, theme } = req.body
    
    const todoList = new TodoList({
      title: title || "Namnlös lista",
      tasks: tasks || [],
      theme: theme || "photo_lighthouse",
      user: req.user._id
    })
    
    await todoList.save()
    
    res.status(201).json(todoList)
  } catch (error) {
    console.log("Error creating todo list", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/:id", protectRoute, async (req, res) => {
  try {
    const { title, tasks, theme } = req.body
    
    const todoList = await TodoList.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    
    if (!todoList) {
      return res.status(404).json({ message: "Todo list not found" })
    }
    
    if (title !== undefined) todoList.title = title
    if (tasks !== undefined) todoList.tasks = tasks
    if (theme !== undefined) todoList.theme = theme
    
    await todoList.save()
    
    res.json(todoList)
  } catch (error) {
    console.log("Error updating todo list", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const result = await TodoList.deleteOne({
      _id: req.params.id,
      user: req.user._id
    })
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Todo list not found" })
    }
    
    res.json({ message: "Todo list deleted successfully" })
  } catch (error) {
    console.log("Error deleting todo list", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router