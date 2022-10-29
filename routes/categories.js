const express = require('express');
const router = express.Router();

const sendResponse = require('../helpers/utils');

const { Category } = require('../models/category');

// TODO: Note - convert this to async/await methods?
router.get(`/`, (_req, res) => {
    Category.find()
        .then((categories) => {
            if (!categories) {
                return res.status(404).json(sendResponse(false, 'Categories not found'));
            }

            return res.status(200).send(categories);
        })
        .catch((err) =>
            res.status(500).json(sendResponse(false, `Failed to get all categories: ${err}`))
        );
});

router.get('/:id', (req, res) => {
    Category.findById(req.params.id)
        .then((category) => {
            if (!category) {
                return res
                    .status(404)
                    .json(sendResponse(false, `Category ${req.params.id} not found`));
            }

            return res.status(200).send(category);
        })
        .catch((err) =>
            res
                .status(500)
                .send(sendResponse(false, `Failed to get category ${req.params.id}: ${err}`))
        );
});

router.post('/', (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    category
        .save()
        .then((category) => {
            if (!category)
                return res.status(400).json(sendResponse(false, 'Category cannot be created'));

            return res.status(200).send(category);
        })
        .catch((err) =>
            res.status(500).json(sendResponse(false, `Failed to create category: ${err}`))
        );
});

router.put('/:id', (req, res) => {
    Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || category.icon,
            color: req.body.color
        },
        { new: true }
    )
        .then((category) => {
            if (!category)
                return res
                    .status(400)
                    .json(sendResponse(false, `Category ${req.params.id} cannot be updated`));

            return res.status(200).send(category);
        })
        .catch((err) =>
            res
                .status(500)
                .json(sendResponse(false, `Failed to update category ${req.params.id}: ${err}`))
        );
});

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id)
        .then((category) => {
            if (!category)
                return res
                    .status(400)
                    .json(sendResponse(false, `Category ${req.params.id} cannot be deleted`));

            return res.status(200).send(sendResponse(true, 'Category is deleted'));
        })
        .catch((err) =>
            res.status(500).json(sendResponse(false, `Failed to delete category: ${err}`))
        );
});

module.exports = router;
