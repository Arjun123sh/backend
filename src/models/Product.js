const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Admin who created the product
    },
    title: {
        type: String,
        required: [true, 'Please add a product title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Please specify a category'],
        // enum: ['Desk Organizers', 'Lighting', 'Tech Accessories', 'Seating', 'Stationery']
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        default: 0
    },
    productImage: {
        type: String,
        required: [true, 'Please add an image URL'],
        default: '/images/placeholder.jpg'
    },
}, {
    timestamps: true
});

// Add index for optimized search by title
productSchema.index({ title: 'text' });

productSchema.set('toJSON', {
    virtuals: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
