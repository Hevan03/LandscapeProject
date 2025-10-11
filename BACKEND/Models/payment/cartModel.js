import mongoose from "mongoose";

// Schema for an individual item within the cart
const cartItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Item", // Reference the Item model
    },
    itemName: {
      type: String,
      required: true,
    },
    pricePerItem: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
    },
  },
  { _id: false }
); // _id: false prevents automatic generation of _id for subdocuments

// Schema for the overall cart
const cartSchema = new mongoose.Schema(
  {
    customerId: {
      type: String, // You can use a session ID to identify the cart
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema], // Array of cart items
      default: [],
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total price for each item before saving
cartItemSchema.pre("validate", function (next) {
  this.totalPrice = this.quantity * this.pricePerItem;
  next();
});

// Explicitly name the models to match your collection names
const Cart = mongoose.model("carts", cartSchema);
const CartItem = mongoose.model("cartitems", cartItemSchema);

export { Cart, CartItem };
