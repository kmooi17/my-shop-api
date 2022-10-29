const mongoose = require('mongoose');

const CHARACTER_LENGTH_LIMITS = require('../helpers/constants');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.LONG_LONG
    },
    description: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.MAX
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [
        {
            type: String
        }
    ],
    brand: {
        type: String,
        default: '',
        maxlength: CHARACTER_LENGTH_LIMITS.LONG
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: CHARACTER_LENGTH_LIMITS.MAX
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: new Date()
    }
});

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true
});

exports.Product = mongoose.model('Product', productSchema);
