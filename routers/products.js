const { Category } = require("../models/category");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const { error } = require("console");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid Image Type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

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

router.post(`/`, uploadOptions.single("image"), async (req, res, next) => {
  const category = await Category.findById(req.body.category);

  if (!category) return res.status(400).send("Invalid Category");
  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  let product = new Product({
    Name: req.body.Name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
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

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  try {
    // Validate product ID
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }

    // Validate category
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send("Invalid Category");
    }

    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(400).send("Invalid Product");
    }

    // Handle image upload
    const file = req.file;
    let imagePath = product.image;

    if (file) {
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      imagePath = `${basePath}${fileName}`;
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        Name: req.body.Name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagePath,
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

    if (!updatedProduct) {
      return res.status(500).send("Product not Updated!");
    }

    res.status(200).send(updatedProduct);
  } catch (err) {
    res.status(500).send("An error occurred: " + err.message);
  }
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

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 20),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid Product Id");
      }

      let imagesPaths = [];
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      const files = req.files;

      if (files) {
        files.forEach((file) => {
          imagesPaths.push(`${basePath}${file.filename}`); // Use file.filename instead of file.fileName
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imagesPaths,
        },
        { new: true }
      );

      if (!product) {
        return res.status(500).send("Product not Updated!");
      }

      res.send(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
