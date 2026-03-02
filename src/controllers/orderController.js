const Order = require('../models/Order');
const Product = require('../models/Product');
const Stripe = require('stripe');
const Cart = require("../models/Cart");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const addOrderItems = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, paymentMethod } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        let itemsPrice = 0;
        const dbOrderItems = [];

        for (const item of orderItems) {
            const productFromDb = await Product.findById(item.product);

            if (!productFromDb) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (productFromDb.stockQuantity < item.qty) {
                return res.status(400).json({
                    message: `Not enough stock for ${productFromDb.title}`
                });
            }

            itemsPrice += productFromDb.price * item.qty;

            dbOrderItems.push({
                title: productFromDb.title,
                qty: item.qty,
                image: productFromDb.productImage,
                price: productFromDb.price,
                product: productFromDb._id
            });
        }

        const shippingPrice = itemsPrice > 100 ? 0 : 10;
        const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
        const totalPrice = itemsPrice + shippingPrice + taxPrice;

        const order = await Order.create({
            orderItems: dbOrderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        // 🔥 Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalPrice * 100),
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: {
                orderId: order._id.toString(),
            },
        });

        return res.status(201).json({
            order,
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error("Stripe Error:", error);
        return res.status(500).json({ message: error.message });
    }
};
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            'user',
            'name email'
        );

        if (order) {
            // Check if user is admin or the order belongs to the user
            if (req.user.role === 'admin' || order.user._id.toString() === req.user._id.toString()) {
                res.json(order);
            } else {
                res.status(401);
                throw new Error('Not authorized to view this order');
            }
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update order to paid & Deduct Stock
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();

            // Payment Result from Stripe Webhook or Client
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            const updatedOrder = await order.save();

            // Deduct stock after successful payment
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stockQuantity -= item.qty;
                    await product.save();
                }
            }

            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (Admin) & Dashboard Stats
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });

        // Calculate total revenue and sales
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);

        res.json({ orders, totalOrders, totalRevenue });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};


const updatePaymentStatus = async (req, res, next) => {
    console.log("Updating payment status for order:", req.body);

    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.isPaid) {
            return res.status(400).json({ message: "Order already paid" });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.paymentIntentId,
        };

        const updatedOrder = await order.save();


        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stockQuantity -= item.qty;
                await product.save();
            }
        }

        await Cart.findOneAndUpdate(
            { user: order.user },
            { cartItems: [] }
        );

        res.json(updatedOrder);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    updateOrderToDelivered,
    updatePaymentStatus,
};
