const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sendResponse = require('../helpers/utils');

const { User } = require('../models/user');

router.get(`/`, async (_req, res) => {
    try {
        const userList = await User.find().select('-passwordHash');

        if (!userList) {
            return res.status(404).json(sendResponse(false, 'Users not found'));
        }

        return res.status(200).send(userList);
    } catch (err) {
        return res.status(500).json(sendResponse(false, `Failed to get all users: ${err}`));
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');

        if (!user) {
            return res.status(404).json(sendResponse(false, `User ${req.params.id} not found`));
        }

        return res.status(200).send(user);
    } catch (err) {
        return res
            .status(500)
            .json(sendResponse(false, `Failed to get user ${req.params.id}: ${err}`));
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) {
            return res.json(sendResponse(false, 'Please enter all user details'));
        }

        //Check if the user already exist or not
        const userExist = await User.findOne({ email: req.body.email });
        if (userExist) {
            return res.status(400).json(sendResponse(false, 'Failed to create user'));
        }

        let user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        });

        user = await user.save();

        if (!user) return res.status(400).json(sendResponse(false, 'User cannot be created'));

        return res.status(200).send(user);
    } catch (err) {
        return res.status(500).json(sendResponse(false, `Failed to create user: ${err}`));
    }
});

router.put('/:id', async (req, res) => {
    try {
        const userExist = await User.findById(req.params.id);
        if (!userExist) {
            return res.status(404).json(sendResponse(false, `User ${req.params.id} not found`));
        }

        let newPassword = userExist.passwordHash;
        if (req.body.password) {
            newPassword = bcrypt.hashSync(req.body.password, 10);
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
                passwordHash: newPassword,
                phone: req.body.phone,
                isAdmin: req.body.isAdmin,
                street: req.body.street,
                apartment: req.body.apartment,
                zip: req.body.zip,
                city: req.body.city,
                country: req.body.country
            },
            { new: true }
        );

        if (!user)
            return res
                .status(400)
                .json(sendResponse(false, `User ${req.params.id} cannot be updated`));

        return res.status(200).send(user);
    } catch (err) {
        return res.status(500).json(sendResponse(false, `Failed to update user: ${err}`));
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) {
            return res.json(sendResponse(false, 'Please enter all user details'));
        }

        //Check if the user already exist or not
        const userExist = await User.findOne({ email: req.body.email });
        if (userExist) {
            return res.status(400).json(sendResponse(false, 'Failed to create user'));
        }

        let user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        });

        user = await user.save();

        if (!user) return res.status(400).json(sendResponse(false, 'User cannot be created'));

        return res.status(200).send(user);
    } catch (err) {
        return res.status(500).json(sendResponse(false, `Failed to create user: ${err}`));
    }
});

router.post('/login', async (req, res) => {
    try {
        const secret = process.env.SECRET;
        const jwtExpire = process.env.TOKEN_EXPIRY;

        const { email, password } = req.body;
        if (!email || !password) {
            return res.json(sendResponse('Please enter all user details'));
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json(sendResponse(false, 'Wrong credentials'));
        }

        if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
            const token = jwt.sign(
                {
                    userId: user.id,
                    isAdmin: user.isAdmin
                },
                secret,
                { expiresIn: jwtExpire.toString() }
            );

            return res.status(200).send({ user: user.email, token: token });
        } else {
            return res.status(400).json(sendResponse(false, 'Wrong credentials'));
        }
    } catch (err) {
        return res.status(500).json(sendResponse(false, `Failed to login: ${err}`));
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id);
        if (!user) {
            return res
                .status(404)
                .json(sendResponse(false, `User ${req.params.id} cannot be deleted`));
        }

        return res.status(200).send(sendResponse(true, 'User is deleted'));
    } catch (err) {
        return res.status(500).json(sendResponse(false, `Failed to delete user: ${err}`));
    }
});

router.get(`/get/count`, async (req, res) => {
    try {
        const userCount = await User.countDocuments((count) => count);
        if (!userCount) {
            return res.status(400).json(sendResponse(false, 'Could not count users'));
        }

        return res.status(200).send({
            userCount: userCount
        });
    } catch (err) {
        return res.status(500).json(sendResponse(false, `Failed to count users: ${err}`));
    }
});

module.exports = router;
