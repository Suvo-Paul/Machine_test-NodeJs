const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    pvValue: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    stock: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
