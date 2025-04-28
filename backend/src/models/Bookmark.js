import mongoose from "mongoose"

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true
  }
}, 
  {timestamps: true}
)

bookmarkSchema.index({ user: 1, recipe: 1 }, { unique: true })

const Bookmark = mongoose.model("Bookmark", bookmarkSchema)

export default Bookmark