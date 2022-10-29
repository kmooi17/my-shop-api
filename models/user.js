const mongoose = require('mongoose');

const CHARACTER_LENGTH_LIMITS = require('../helpers/constants');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.DEFAULT
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.MAX
    },
    passwordHash: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.DEFAULT,
        maxlength: CHARACTER_LENGTH_LIMITS.LONG_LONG
    },
    phone: {
        type: String,
        required: true,
        minlength: CHARACTER_LENGTH_LIMITS.PHONE,
        maxlength: CHARACTER_LENGTH_LIMITS.PHONE
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    street: {
        type: String,
        default: '',
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.LONG
    },
    apartment: {
        type: String,
        default: '',
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.LONG
    },
    zip: {
        type: String,
        default: '',
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.DEFAULT
    },
    city: {
        type: String,
        default: '',
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.LONG
    },
    country: {
        type: String,
        default: '',
        minlength: CHARACTER_LENGTH_LIMITS.MIN,
        maxlength: CHARACTER_LENGTH_LIMITS.LONG
    },
    dateCreated: {
        type: Date,
        default: new Date()
    }
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
