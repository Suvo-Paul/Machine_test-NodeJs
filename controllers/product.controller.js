const productCollection = require("../models/product.model");
const categoryCollection = require("../models/category.model");
const mongoose = require("mongoose")


// 5 stages of mongodb aggregation
// 1. $match
// 2. $group
// 3. $lookup
// 4. $sort
// 5. $project



// Creating a new product
const addProduct = async (req, res) => {
    try {
        const { productName, description, price, pvValue, category, stock } = req.body;

        if (!productName || !price || !category) {
            return res.status(400).json({ message: "Product name, price, and category are required." });
        }

        if (price <= 0) {
            return res.status(400).json({ message: "Price must be a positive number." });
        }

        if (stock < 0) {
            return res.status(400).json({ message: "Stock cannot be negative." });
        }

        const existingCategory = await categoryCollection.findById(category);
        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found." });
        }

        const existingProduct = await productCollection.findOne({ productName });
        if (existingProduct) {
            return res.status(400).json({ message: "Product name already exists." });
        }

        const newProduct = new productCollection({
            productName,
            description,
            price,
            pvValue: pvValue || 0,
            category,
            stock: stock || 0
        });

        await newProduct.save();

        res.status(201).json({ message: "Product added successfully", product: newProduct });

    } catch (error) {
        res.status(500).json({ message: "Error adding product", error: error.message });
    }
};


// Write a controller function to calculate:
// Average price of all products.
// Total pvValue for all products.

const calculateProductStats = async (req, res) => {
    try {
        const stats = await productCollection.aggregate([
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: "$price" },
                    totalPvValue: { $sum: "$pvValue" }
                }
            }
        ]);

        if (!stats.length) {
            return res.status(404).json({ message: "No products found." });
        }

        res.status(200).json({
            averagePrice: stats[0].avgPrice,
            totalPvValue: stats[0].totalPvValue
        });

    } catch (error) {
        res.status(500).json({ message: "Error calculating product statistics", error: error.message });
    }
};


// Write a function to group products into price ranges (e.g., 0-100, 101-500, 501-1000, 1000+).

const groupProductsByPriceRange = async (req, res) => {
    try {
        const priceRanges = await productCollection.aggregate([
            {
                $bucket: {
                    groupBy: "$price",
                    boundaries: [0, 100, 500, 1000],
                    default: "1000+",
                    output: {
                        count: { $sum: 1 },
                        products: { $push: "$$ROOT" }
                    }
                }
            }
        ]);
        res.status(200).json(priceRanges);
    } catch (err) {
        throw new Error(`Error grouping products by price range: ${err.message}`);
    }
};


// Write an aggregation query to find the product with the highest price in each category.

const findHighestPriceInEachCategory = async (req, res) => {
    try {
        const highestPrices = await productCollection.aggregate([
            {
                $group: {
                    _id: "$category",
                    highestPrice: { $max: "$price" }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $unwind: "$categoryDetails"
            },
            {
                $project: {
                    _id: 0,
                    categoryId: "$_id",
                    categoryName: "$categoryDetails.categoryName",
                    highestPrice: 1
                }
            }
        ]);

        res.status(200).json(highestPrices);
    } catch (err) {
        res.status(500).json({ message: `Error finding highest price in each category: ${err.message}` });
    }
};



// Write a query that implements pagination to fetch products with the option to sort by price and filter by category.

// fetchendproductsURL = http://localhost:5000/api/products/fetchProductsPaginated?page=1&limit=10&sortField=price&sortOrder=asc&category=67ebb13e62464577020874bf

const fetchProductsPaginated = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortField = "price", sortOrder = "asc", category } = req.query;

        const query = {};

        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({ message: "Invalid category ID" });
            }
            query.category = new mongoose.Types.ObjectId(category);
        }

        const products = await productCollection.find(query)
            .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: `Error fetching paginated products: ${err.message}` });
    }
};



// Write a query to search for products by productName and description using a case-insensitive match.
// searchProductsURL = http://localhost:5000/api/product/searchProducts?query=oppo

const searchProducts = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search keyword is required." });
        }

        const products = await productCollection.find({
            $or: [
                { productName: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: `Error searching products: ${err.message}` });
    }
};


module.exports = { addProduct, calculateProductStats, groupProductsByPriceRange, findHighestPriceInEachCategory, fetchProductsPaginated, searchProducts };
