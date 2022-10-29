const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const multer = require('multer');
const sendResponse = require('../helpers/utils');

const { Category } = require('../models/category');
const { Product } = require('../models/product');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (_req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid Image Type');

        if (isValid) {
            uploadError = null;
        }

        cb(uploadError, 'public/uploads');
    },
    filename: function (_req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    try {
        let filter = {};
        if (req.query.categories) {
            filter = { category: req.query.categories.split(',') };
        }

        const productList = await Product.find(filter).populate('category');

        if (!productList) {
            return res.status(404).json(sendResponse(false, 'Products not found'));
        }

        return res.status(200).send(productList);
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to get all products: ${error}`));
    }
});

router.get(`/:id`, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');

        if (!product) {
            return res.status(404).json(sendResponse(false, `Product ${req.params.id} not found`));
        }

        return res.status(200).send(product);
    } catch (error) {
        return res
            .status(500)
            .json(sendResponse(false, `Failed to get product ${req.params.id}: ${error}`));
    }
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(404).json(sendResponse(false, 'Invalid Category'));

        const file = req.file;
        if (!file) return res.status(400).json(sendResponse(false, 'No image in the request'));

        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        });

        product = await product.save();

        if (!product) return res.status(500).json(sendResponse(false, 'Product cannot be created'));

        return res.status(200).send(product);
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to create product: ${error}`));
    }
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    try {
        // TODO:: This validation should be on all requests with an id
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json(sendResponse(false, 'Invalid Product ID'));
        }

        const category = await Category.findById(req.body.category);
        if (!category) return res.status(404).json(sendResponse(false, 'Invalid Category'));

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json(sendResponse(false, 'Invalid Product'));

        const file = req.file;
        let imagepath = product.image;

        if (file) {
            const fileName = file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            imagepath = `${basePath}${fileName}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: imagepath,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured
            },
            { new: true }
        );

        if (!updatedProduct)
            return res
                .status(400)
                .json(sendResponse(false, `Product ${req.params.id} cannot be updated`));

        return res.status(200).send(updatedProduct);
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to update product: ${error}`));
    }
});

router.delete('/:id', (req, res) => {
    try {
        const product = Product.findByIdAndRemove(req.params.id);
        if (!product) {
            return res
                .status(404)
                .json(sendResponse(false, `Product ${req.params.id} cannot be deleted`));
        }

        return res.status(200).send(sendResponse(true, 'Product is deleted'));
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to delete product: ${error}`));
    }
});

router.get(`/get/count`, async (_req, res) => {
    try {
        const productCount = await Product.countDocuments((count) => count);

        if (!productCount) {
            return res.status(400).json(sendResponse(false, 'Could not count products'));
        }

        return res.status(200).send({
            productCount: productCount
        });
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to count products: ${error}`));
    }
});

router.get(`/get/featured/:count`, async (req, res) => {
    try {
        const count = req.params.count ? req.params.count : 0;
        const products = await Product.find({ isFeatured: true }).limit(+count);

        if (!products) {
            return res.status(400).json(sendResponse(false, 'Could not count featured products'));
        }

        return res.status(200).send(products);
    } catch (error) {
        return res
            .status(500)
            .json(sendResponse(false, `Failed to count featured products: ${error}`));
    }
});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).send(sendResponse(false, 'Invalid Product ID'));
        }

        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true }
        );

        if (!product)
            return res.status(400).json(sendResponse(false, 'Gallery Images cannot be updated'));

        res.status(200).send(product);
    } catch (error) {
        return res
            .status(500)
            .json(sendResponse(false, `Failed to update gallery images: ${error}`));
    }
});

module.exports = router;
