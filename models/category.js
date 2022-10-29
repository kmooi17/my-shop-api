const mongoose = require('mongoose');

const CHARACTER_LENGTH_LIMITS = require('../helpers/constants');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.DEFAULT
    },
    icon: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.DEFAULT
    },
    color: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.DEFAULT
    },
    dateCreated: {
        type: Date,
        default: new Date()
    }
});

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true
});

exports.Category = mongoose.model('Category', categorySchema);
