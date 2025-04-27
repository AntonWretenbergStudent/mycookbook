import mongoose from "mongoose"

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    default: "to taste"
  },
  unit: {
    type: String,
    default: ""
  }
}, { _id: false })

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true  
  },
  caption: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true  
  },
  rating: {
    type: Number,
    required: true, 
    min: 1,
    max: 5,
  },
  ingredients: {
    type: [ingredientSchema],
    default: []
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true 
  }
}, 
  {timestamps: true }
)

const Recipe = mongoose.model("Recipe", recipeSchema)

export default Recipe