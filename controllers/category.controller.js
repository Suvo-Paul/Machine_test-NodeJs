const categoryCollection = require('../models/category.model');
const productCollection = require("../models/product.model")

const createCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;

        if (!categoryName) {
            return res.status(400).json({ message: "Category name is required." });
        }

        const existingCategory = await categoryCollection.findOne({ categoryName });
        if (existingCategory) {
            return res.status(400).json({ message: "Category name already exists." });
        }

        const newCategory = new categoryCollection({
            categoryName,
            description
        });

        await newCategory.save();

        res.status(201).json({ message: "Category created successfully", category: newCategory });

    } catch (error) {
        res.status(500).json({ message: "Error creating category", error: error.message });
    }
};



// Write a function that updates the description of a category and, if the category is updated,
// also updates all related products by adding the new description of the category to the product's description.

const updateCategoryDescription = async (req, res) => {
    const { categoryId } = req.params;
    const { newDescription } = req.body;

    try {
        const updatedCategory = await categoryCollection.findByIdAndUpdate(
            categoryId,
            { description: newDescription },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: `Category not found with id ${categoryId}` });
        }


        const updateResult = await productCollection.updateMany(
            { category: categoryId },
            [
                {
                    $set: {
                        description: { $concat: ["$description", " ", newDescription] }
                    }
                }
            ]
        )

        res.status(200).json({ updatedCategory, updateResult })

    } catch (err) {
        res.status(500).json({ message: `Error updating category description: ${err.message}` });
    }
};

module.exports = { createCategory, updateCategoryDescription };
