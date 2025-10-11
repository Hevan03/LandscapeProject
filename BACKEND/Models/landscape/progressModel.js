import mongoose from "mongoose";

// sub schema for tasks.
const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  
  },
  completed: {
    type: Boolean,
    default: false,  
  },
});

// Main schema for "Progress Post"
const progressSchema = new mongoose.Schema(
  {
    landscapeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Landscape", // Reference Landscape project
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // Reference Customer
      required: true, 
    },
    landscaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Landscaper", // Reference Landscaper
      required: true, 
    },
    name: {
      type: String,
      required: true,  
    },
    description: {
      type: String,
      required: false, 
    },
    tasks: {
      type: [taskSchema], 
      required: true,
    },
    percentage: {
      type: Number,
      default: 0, 
    },
    images: {
      type: [String], 
      validate: [arrayLimit, "{PATH} must contain exactly 5 images"],
    },
  },
  {
    timestamps: true, 
  }
);

// validation for 5 images
function arrayLimit(val) {
  return val.length === 5;
}

// percentage = (completed tasks / total tasks) * 100
progressSchema.pre("save", function (next) {
  if (this.tasks.length > 0) {
    const completedTasks = this.tasks.filter((t) => t.completed).length;
    this.percentage = Math.round((completedTasks / this.tasks.length) * 100);
  } else {
    this.percentage = 0;
  }
  next();
});

 
progressSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.tasks && update.tasks.length > 0) {
    const completedTasks = update.tasks.filter((t) => t.completed).length;
    update.percentage = Math.round(
      (completedTasks / update.tasks.length) * 100
    );
  }
  next();
});

const progressModel = mongoose.model("Progress", progressSchema);

export default progressModel;
