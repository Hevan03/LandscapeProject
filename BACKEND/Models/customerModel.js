import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

const customerModel = mongoose.model("Customer", customerSchema);
export default customerModel;
