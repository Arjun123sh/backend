const Product = require('../models/Product');

// @desc    Fetch all products with pagination, search, filter, and sort
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const pageSize = Number(req.query.pageSize) || 10;
        const page = Number(req.query.pageNumber) || 1;

        // Search query using text index for performance
        const keyword = req.query.keyword
            ? { $text: { $search: req.query.keyword } }
            : {};

        // Filter by category
        const categoryFilter = req.query.category
            ? { category: req.query.category }
            : {};

        const filterObj = { ...keyword, ...categoryFilter };

        // Sort by price
        const sortObj = {};
        if (req.query.sort) {
            if (req.query.sort === 'lowest') sortObj.price = 1;
            if (req.query.sort === 'highest') sortObj.price = -1;
        } else {
            sortObj.createdAt = -1; // Default sort by newest
        }

        const count = await Product.countDocuments(filterObj);
        const products = await Product.find(filterObj)
            .sort(sortObj)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        next(error);
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
    try {
        const { title, description, price, category, stockQuantity, productImage } = req.body;

        const product = new Product({
            title,
            description,
            price,
            category,
            stockQuantity,
            productImage,
            user: req.user._id,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
    try {
        const { title, description, price, category, stockQuantity, productImage } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.title = title || product.title;
            product.description = description || product.description;
            product.price = price !== undefined ? price : product.price;
            product.category = category || product.category;
            product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
            product.productImage = productImage || product.productImage;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
