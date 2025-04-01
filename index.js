const express = require("express")
const app = express()
const dotenv = require("dotenv")

dotenv.config()
app.use(express.json())
require("./db")

const port = process.env.PORT || 5000

const productRoute = require("./routes/product.routes")
const categoryRoute = require("./routes/category.routes");

app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})