const express = require('express');
const router = express.Router();

const sendResponse = require('../helpers/utils');

const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');

router.get(`/`, async (_req, res) => {
    try {
        const orderList = await Order.find().populate('user', 'name').sort({ dateOrdered: -1 });
        if (!orderList) {
            return res.status(404).json(sendResponse(false, 'Orders not found'));
        }

        return res.status(200).send(orderList);
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to get all orders: ${error}`));
    }
});

router.get(`/:id`, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    populate: 'category'
                }
            });

        if (!order) {
            return res.status(500).json(sendResponse(false, `Order ${req.params.id} not found`));
        }

        return res.status(200).send(order);
    } catch (error) {
        return res
            .status(500)
            .json(sendResponse(false, `Failed to get order ${req.params.id}: ${error}`));
    }
});

router.post('/', async (req, res) => {
    try {
        const orderItemsIds = Promise.all(
            req.body.orderItems.map(async (orderitem) => {
                let newOrderItem = new OrderItem({
                    quantity: orderitem.quantity,
                    product: orderitem.product
                });

                newOrderItem = await newOrderItem.save();

                return newOrderItem._id;
            })
        );

        const orderItemsIdsResolved = await orderItemsIds;

        const totalPrices = await Promise.all(
            orderItemsIdsResolved.map(async (orderItemId) => {
                const orderItem = await OrderItem.findById(orderItemId).populate(
                    'product',
                    'price'
                );

                const totalPrice = orderItem.product.price * orderItem.quantity;

                return totalPrice;
            })
        );

        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        let order = new Order({
            orderItems: orderItemsIdsResolved,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user
        });

        order = await order.save();

        if (!order) return res.status(400).json(sendResponse(false, 'Order cannot be created'));

        return res.status(200).send(order);
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to create order: ${error}`));
    }
});

router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            { new: true }
        );

        if (!order)
            return res
                .status(400)
                .json(sendResponse(false, `Order ${req.params.id} cannot be updated`));

        return res.status(200).send(order);
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to update order status: ${error}`));
    }
});

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id)
        .then(async (order) => {
            if (order) {
                await order.orderItems.map(async (orderItem) => {
                    await OrderItem.findByIdAndRemove(orderItem);
                });

                return res.status(200).send(sendResponse(true, 'Order is deleted'));
            } else {
                return res.status(404).json(sendResponse(false, 'Order not found'));
            }
        })
        .catch((error) => {
            return res.status(500).json(sendResponse(false, `Failed to delete order: ${error}`));
        });
});

router.get('/get/totalsales', async (_req, res) => {
    try {
        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
        ]);

        if (!totalSales) {
            return res
                .status(400)
                .json(sendResponse(false, 'The order total sales cannot be generated'));
        }

        return res.status(200).send({ totalsales: totalSales.pop().totalsales });
    } catch (error) {
        return res
            .status(500)
            .json(sendResponse(false, `Failed to get the order total sales: ${error}`));
    }
});

router.get(`/get/count`, async (_req, res) => {
    try {
        const orderCount = await Order.countDocuments((count) => count);

        if (!orderCount) {
            return res.status(400).json(sendResponse(false, 'Could not count orders'));
        }

        return res.status(200).send({
            orderCount: orderCount
        });
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to count orders: ${error}`));
    }
});

router.get(`/get/userorders/:userid`, async (req, res) => {
    try {
        const userOrderList = await Order.find({ user: req.params.userid })
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    populate: 'category'
                }
            })
            .sort({ dateOrdered: -1 });

        if (!userOrderList) {
            return res
                .status(404)
                .json(sendResponse(false, `User ${req.params.userid} orders not found`));
        }

        return res.status(200).send(userOrderList);
    } catch (error) {
        return res.status(500).json(sendResponse(false, `Failed to get user's orders: ${error}`));
    }
});

module.exports = router;
