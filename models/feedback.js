const mongoose = require('mongoose');

const CHARACTER_LENGTH_LIMITS = require('../helpers/constants');

const feedbackSchema = mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 5
    },
    type: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.DEFAULT
    },
    description: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.MAX_MAX
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    dateCreated: {
        type: Date,
        default: new Date()
    }
});

feedbackSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

feedbackSchema.set('toJSON', {
    virtuals: true
});

exports.Feedback = mongoose.model('Feedback', feedbackSchema);
