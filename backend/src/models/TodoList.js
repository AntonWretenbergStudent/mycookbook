import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  starred: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false })

const todoListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "Namnlös lista"
  },
  tasks: {
    type: [taskSchema],
    default: []
  },
  theme: {
    type: String,
    required: true,
    default: "photo_lighthouse"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, 
  {timestamps: true}
)

const TodoList = mongoose.model("TodoList", todoListSchema)

export default TodoList