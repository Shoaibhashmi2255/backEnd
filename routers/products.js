const { Category } = require("../models/category");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/`, async (req, res, next) => {
  // localhost:3000/api/v1/products?categories=2342342,234234
  let filter = {};

  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  try {
    const productList = await Product.find(filter).populate("category");

    if (!productList || productList.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found." });
    }

    res.status(200).json({ success: true, products: productList });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

router.get(`/:id`, async (req, res, next) => {
  const product = await Product.findById({ _id: req.params.id }).populate(
    "category"
  );

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.post(`/`, async (req, res, next) => {
  const category = await Category.findById(req.body.category);

  if (!category) return res.status(400).send("Invalid Category");

  let product = new Product({
    Name: req.body.Name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();
  if (!product) return res.status(500).send("Product not Created");

  res.status(200).send(product);
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId({ _id: req.params.id })) {
    res.status(400).send("Invalid Product Id");
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  let updateProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      Name: req.body.Name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!updateProduct) {
    return res.status(500).send("Product not Updated!");
  }
  res.send(updateProduct);
});

router.delete("/:id", (req, res) => {
  Product.findOneAndDelete({ _id: req.params.id })
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "Category is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Category is not deleted" });
      }
    })
    .catch((err) => {
      return res.status(404).json({ success: false, error: "err" });
    });
});

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);
  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

module.exports = router;
