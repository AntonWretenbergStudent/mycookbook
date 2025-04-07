import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Recipe from "../models/Recipe.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !caption || !rating) {
      return res.status(400).json({ message: "Please provide an image" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newRecipe = new Recipe({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });

    await newRecipe.save();

    res.status(201).json(newRecipe);
  } catch (error) {
    console.log("Error creating recipe", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalRecipe = await Recipe.countDocuments();

    res.send({
      recipes,
      currentPage: page,
      totalRecipe,
      totalRecipe: Math.ceil(totalRecipe / limit),
    });
  } catch (error) {
    console.log("Error in get all recipe route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user", protectRoute, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(recipes)
  } catch (error) {
    console.log("Get user recipes error", error);
    res.status(500).json({ message: "Server error" })
  }
})

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // check if user is the creater of the recipe
    if (recipe.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    // delete img from cloudinary as well
    if(recipe.image && recipe.image.includes("cloudinary")) {
      try {
        const publicId = recipe.image.split("/").pop().split(".")[0]
        await cloudinary.uploader.destroy(publicId)
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary", deleteError);
      }
    }

    await recipe.deleteOne();

    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.log("Error deleting recipe", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
