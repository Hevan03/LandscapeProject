import mongoose from "mongoose";

// Schema for a Landscape Project
const landscapeSchema = new mongoose.Schema(
  {
    name: { type: String, 
            required: true },
    description: { type: String },
    customerId: { type: mongoose.Schema.Types.ObjectId, 
                  ref: "Customer", required: true },
    landscaperId: { type: mongoose.Schema.Types.ObjectId, 
                    ref: "Landscaper", required: true },
    status: { type: String, 
              enum: ["Advance Payment Pending", "In Progress", "Completed"], default: "Advance Payment Pending" },
    
    // --- NEW FIELDS ADDED HERE ---
    projectImages: { 
        type: [{ type: String }], // An array to hold multiple image paths
        default: [] 
    },
    sitePlan: { 
        type: String, // A single path for the PDF site plan
        default: ''
    },
    totalCost: { 
        type: Number,
        required: true,
    },
    quotation: { 
        type: String,
        default: ''
},
 blueprintRequested: {
        type: Boolean,
        default: false,
    },
    blueprintFile: {
        type: String, // Path to the uploaded PDF blueprint
        default: '',
    },
    // --- END OF NEW FIELDS ---
  },

  { timestamps: true }
);

const landscapeModel = mongoose.model("Landscape", landscapeSchema);
export default landscapeModel;