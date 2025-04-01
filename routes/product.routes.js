const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.post("/addProduct", productController.addProduct);
router.get("/calculateProductStats", productController.calculateProductStats);
router.get("/groupProductsByPriceRange", productController.groupProductsByPriceRange);
router.get("/findHighestPriceInEachCategory", productController.findHighestPriceInEachCategory);
router.get("/fetchProductsPaginated", productController.fetchProductsPaginated);
router.get("/searchProducts", productController.searchProducts);

module.exports = router