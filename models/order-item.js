const mongoose = require('mongoose');

const CHARACTER_LENGTH_LIMITS = require('../helpers/constants');

const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
        min: 0,
        max: CHARACTER_LENGTH_LIMITS.LONG
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    }
});

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);
