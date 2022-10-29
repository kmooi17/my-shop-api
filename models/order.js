const mongoose = require('mongoose');

const CHARACTER_LENGTH_LIMITS = require('../helpers/constants');

const orderSchema = mongoose.Schema({
    orderItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
            required: true
        }
    ],
    shippingAddress1: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.LONG
    },
    shippingAddress2: {
        type: String,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.LONG
    },
    city: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.LONG
    },
    zip: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.DEFAULT
    },
    country: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.LONG
    },
    phone: {
        type: String,
        required: true,
        // TODO: Check this for internation numbers
        minlength: CHARACTER_LENGTH_LIMITS.PHONE,
        maxlength: CHARACTER_LENGTH_LIMITS.PHONE
    },
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    totalPrice: {
        type: Number,
        min: CHARACTER_LENGTH_LIMITS.MIN_MIN
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    dateOrdered: {
        type: Date,
        default: new Date()
    }
});

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true
});

exports.Order = mongoose.model('Order', orderSchema);

/**
Order Example:

{
    "orderItems" : [
        {
            "quantity": 3,
            "product" : "5fcfc406ae79b0a6a90d2585"
        },
        {
            "quantity": 2,
            "product" : "5fd293c7d3abe7295b1403c4"
        }
    ],
    "shippingAddress1" : "Flowers Street , 45",
    "shippingAddress2" : "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "5fd51bc7e39ba856244a3b44"
}

 */
