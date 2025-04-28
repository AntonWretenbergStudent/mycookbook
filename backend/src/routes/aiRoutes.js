import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const router = express.Router();

// Initialize the API key
const API_KEY = process.env.GEMINI_API_KEY;

// Route to get AI suggestions based on ingredients
router.post("/suggestions", protectRoute, async (req, res) => {
  try {
    console.log("Received AI suggestion request:", req.body.type);

    const { type, ingredients, image } = req.body;

    if (!type) {
      return res
        .status(400)
        .json({ message: "Type is required (text or image)" });
    }

    let response;

    // Handle text-based ingredients list
    if (type === "text") {
      if (
        !ingredients ||
        !Array.isArray(ingredients) ||
        ingredients.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Ingredients array is required" });
      }

      console.log("Processing text ingredients:", ingredients);

      // Create a structured prompt for text-based ingredients
      // Updated prompt section for text-based ingredients in aiRoutes.js
      const prompt = `I have the following ingredients: ${ingredients.join(
        ", "
      )}.
Please suggest 3 recipes I can make with these ingredients. 

Use this EXACT format for each recipe, and use metric measurements (dl, l, g, kg) instead of cups:

Recipe 1: [Recipe Name]

Description: [Brief description of what this dish is]

Ingredients:
- [ingredient 1 with quantity in dl, l, g, or kg]
- [ingredient 2 with quantity in dl, l, g, or kg]
- [etc.]

Instructions:
1. [First step]
2. [Second step]
3. [etc.]

Recipe 2: [Recipe Name]

Description: [Brief description of what this dish is]

Ingredients:
- [ingredient 1 with quantity in dl, l, g, or kg]
- [ingredient 2 with quantity in dl, l, g, or kg]
- [etc.]

Instructions:
1. [First step]
2. [Second step]
3. [etc.]

Recipe 3: [Recipe Name]

Description: [Brief description of what this dish is]

Ingredients:
- [ingredient 1 with quantity in dl, l, g, or kg]
- [ingredient 2 with quantity in dl, l, g, or kg]
- [etc.]

Instructions:
1. [First step]
2. [Second step]
3. [etc.]`;

      // Make an API call
      response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY,
          },
        }
      );

      // Extract the response text
      const responseText = response.data.candidates[0].content.parts[0].text;

      return res.json({
        success: true,
        response: responseText,
      });
    }
    // Handle image-based ingredients
    else if (type === "image") {
      if (!image || typeof image !== "string") {
        return res
          .status(400)
          .json({ message: "Valid image data is required" });
      }

      console.log("Processing image ingredients");

      // Create a structured prompt for image-based ingredients
      const prompt = `Look at this image of food ingredients. 
      Based on what you can see, suggest 3 recipes I can make.
      
      Use this EXACT format for each recipe:
      
      Recipe 1: [Recipe Name]
      
      Description: [Brief description of what this dish is]
      
      Ingredients:
      - [ingredient 1 with quantity]
      - [ingredient 2 with quantity]
      - [etc.]
      
      Instructions:
      1. [First step]
      2. [Second step]
      3. [etc.]
      
      Recipe 2: [Recipe Name]
      
      Description: [Brief description of what this dish is]
      
      Ingredients:
      - [ingredient 1 with quantity]
      - [ingredient 2 with quantity]
      - [etc.]
      
      Instructions:
      1. [First step]
      2. [Second step]
      3. [etc.]
      
      Recipe 3: [Recipe Name]
      
      Description: [Brief description of what this dish is]
      
      Ingredients:
      - [ingredient 1 with quantity]
      - [ingredient 2 with quantity]
      - [etc.]
      
      Instructions:
      1. [First step]
      2. [Second step]
      3. [etc.]`;

      // Extract the base64 data from the data URL
      const base64Image = image.split(",")[1];

      // Make a direct API call for vision model
      response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent",
        {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY,
          },
        }
      );

      // Extract the response text
      const responseText = response.data.candidates[0].content.parts[0].text;

      return res.json({
        success: true,
        response: responseText,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid type. Must be 'text' or 'image'" });
    }
  } catch (error) {
    console.error(
      "Detailed error in AI suggestions:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Error generating AI suggestions",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
