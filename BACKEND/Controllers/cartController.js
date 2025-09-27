import { Cart, CartItem } from '../Models/cartModel.js';
import Item from '../Models/itemModel.js';

// Get the user's cart based on a session ID
export async function getCart(req, res) {
    const { sessionId } = req.params;
    try {
        const cart = await Cart.findOne({ sessionId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        res.status(200).json(cart);
    } catch (err) {
        console.error("Error fetching cart:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Add an item to the cart or update its quantity
export async function addToCart(req, res) {
    const { sessionId } = req.params;
    const { itemId, quantity = 1 } = req.body;

    try {
        // Find the item details from the main item database
        const product = await Item.findById(itemId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await Cart.findOne({ sessionId });
        if (!cart) {
            // If the cart doesn't exist, create a new one
            cart = new Cart({ sessionId, items: [] });
        }

        // Check if the item already exists in the cart
        const existingItem = cart.items.find(item => item.itemId.toString() === itemId);

        if (existingItem) {
            // If item exists, update its quantity
            existingItem.quantity += parseInt(quantity);
            existingItem.totalPrice = existingItem.quantity * existingItem.pricePerItem;
        } else {
            // If item doesn't exist, add a new one
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
    const { sessionId, itemId } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (quantity === undefined || isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be a positive number." });
    }

    try {
        const cart = await Cart.findOne({ sessionId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        const itemIndex = cart.items.findIndex(item => item.itemId.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart." });
        }

        // Update the item's quantity and total price
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
    const { sessionId, itemId } = req.params;

    try {
        const cart = await Cart.findOne({ sessionId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        const itemIndex = cart.items.findIndex(item => item.itemId.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart." });
        }

        // Remove the item from the array
        cart.items.splice(itemIndex, 1);

        const updatedCart = await cart.save();
        res.status(200).json(updatedCart);
    } catch (err) {
        console.error("Error deleting cart item:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}