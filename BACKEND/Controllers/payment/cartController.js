import { Cart } from "../../Models/payment/cartModel.js";
import Item from "../../Models/inventory/itemModel.js";

// Get the user's cart based on a customer ID
export async function getCart(req, res) {
  const { customerId } = req.params;
  try {
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      // Return empty cart if not found
      return res.status(200).json({ customerId, items: [] });
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Add an item to the cart or update its quantity
export async function addToCart(req, res) {
  const { customerId } = req.params;
  const { itemId, quantity = 1 } = req.body;

  try {
    const product = await Item.findById(itemId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({ customerId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.itemId.toString() === itemId);

    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
      existingItem.totalPrice = existingItem.quantity * existingItem.pricePerItem;
    } else {
      const newCartItem = {
        itemId: product._id,
        itemName: product.itemname,
        pricePerItem: product.price,
        quantity: parseInt(quantity),
        imageUrl: product.imageUrl,
        totalPrice: parseInt(quantity) * product.price,
      };
      cart.items.push(newCartItem);
    }

    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update an existing item's quantity in the cart
export async function updateCartItemQuantity(req, res) {
  const { customerId, itemId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || isNaN(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be a positive number." });
  }

  try {
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    const itemIndex = cart.items.findIndex((item) => item.itemId.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart." });
    }

    cart.items[itemIndex].quantity = parseInt(quantity);
    cart.items[itemIndex].totalPrice = cart.items[itemIndex].pricePerItem * parseInt(quantity);

    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Error updating cart item quantity:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Remove an item from the cart
export async function deleteCartItem(req, res) {
  const { customerId, itemId } = req.params;

  try {
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    const itemIndex = cart.items.findIndex((item) => item.itemId.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart." });
    }

    cart.items.splice(itemIndex, 1);

    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Clear entire cart for a customer
export async function clearCart(req, res) {
  const { customerId } = req.params;
  try {
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }
    cart.items = [];
    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
