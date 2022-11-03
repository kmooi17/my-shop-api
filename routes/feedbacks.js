const express = require('express');
const router = express.Router();

const sendResponse = require('../helpers/utils');

const { Feedback } = require('../models/feedback');

router.get(`/`, async (_req, res) => {
    try {
        const feedbackList = await Feedback.find()
            .populate('user', 'email')
            .sort({ dateCreated: -1 });
        if (!feedbackList) {
            return res.status(404).json(sendResponse(false, 'Feedbacks not found'));
        }

        return res.status(200).send(feedbackList);
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to get all feedbacks: ${error}`));
    }
});

router.get(`/:id`, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id).populate('user', 'email');
        if (!feedback) {
            return res.status(500).json(sendResponse(false, `Feedback ${req.params.id} not found`));
        }

        return res.status(200).send(feedback);
    } catch (error) {
        return res
            .status(500)
            .json(sendResponse(false, `Failed to get feedback ${req.params.id}: ${error}`));
    }
});

router.post('/', async (req, res) => {
    try {
        let feedback = new Feedback({
            rating: req.body.rating,
            type: req.body.type,
            description: req.body.description,
            user: req.body.user
        });

        feedback = await feedback.save();

        if (!feedback)
            return res.status(400).json(sendResponse(false, 'Feedback cannot be created'));

        return res.status(200).send(feedback);
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to create feedback: ${error}`));
    }
});

// This is not needed
// router.put('/:id', async (req, res) => {});

router.delete('/:id', (req, res) => {
    Feedback.findByIdAndRemove(req.params.id)
        .then((feedback) => {
            if (!feedback) {
                return res.status(404).json(sendResponse(false, 'Feedback not found'));
            }

            return res.status(200).send(sendResponse(true, 'Feedback is deleted'));
        })
        .catch((error) => {
            return res.status(500).json(sendResponse(false, `Failed to delete feedback: ${error}`));
        });
});

router.get(`/get/count`, async (_req, res) => {
    try {
        const feedbackCount = await Feedback.countDocuments((count) => count);

        return res.status(200).send({
            feedbackCount: feedbackCount
        });
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to count feedbacks: ${error}`));
    }
});

module.exports = router;
