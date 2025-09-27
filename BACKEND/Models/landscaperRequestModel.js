import mongoose from "mongoose";

const landscaperRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
    },
    landscaper: {
      type: String,
      required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const LandscaperRequest = mongoose.model("LandscaperRequest", landscaperRequestSchema);

export default LandscaperRequest;
