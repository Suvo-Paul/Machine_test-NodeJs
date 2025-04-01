const express = require("express");

const router = express.Router();
const categoryController = require("../controllers/category.controller")

router.post("/createCategory", categoryController.createCategory)
router.put("/updateCategoryDescription/:categoryId", categoryController.updateCategoryDescription)

module.exports = router