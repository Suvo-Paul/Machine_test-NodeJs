const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true,
        maxlength: 50,
        trim: true,
    },
    description: {
        type: String,
        maxLength: 500,
        trim: true
    }
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;
