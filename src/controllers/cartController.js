const Cart = require('../models/Cart');

const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, cartItems: [] });
        }
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addToCart = async (req, res) => {
    const { cartItems, selectedItems } = req.body;
    console.log('addToCart called with cartItems:', cartItems);
    console.log('User ID from request:', req.user);
    
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, cartItems: [] });
        }
        
        if (cartItems && Array.isArray(cartItems)) {
            cartItems.forEach(newItem => {
                const existingItemIndex = cart.cartItems.findIndex(
                    item => item.product.toString() === newItem.product
                );
                
                if (existingItemIndex > -1) {
                    cart.cartItems[existingItemIndex].qty = newItem.qty;
                } else {
                    cart.cartItems.push(newItem);
                }
            });
        }
        
        if (selectedItems && Array.isArray(selectedItems)) {
            cart.selectedItems = selectedItems;
        }
        
        await cart.save();
        
        res.json(cart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: error.message });
    }
};

const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        cart.cartItems = cart.cartItems.filter(
            item => item.product.toString() !== productId
        );
        
        if (cart.selectedItems) {
            cart.selectedItems = cart.selectedItems.filter(id => id !== productId);
        }
        
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        
        if (cart) {
            cart.cartItems = [];
            cart.selectedItems = [];
            await cart.save();
        }
        
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSelectedItems = async (req, res) => {
    const { selectedItems } = req.body;
    
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, cartItems: [], selectedItems: [] });
        }
        
        if (selectedItems && Array.isArray(selectedItems)) {
            cart.selectedItems = selectedItems;
            await cart.save();
        }
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    updateSelectedItems
};
