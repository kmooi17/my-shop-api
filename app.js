const compression = require('compression');
const express = require('express');
const app = express();

const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv/config');

const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

// Middleware
app.use(compression());
app.use(cors());
app.options('*', cors());

app.use(express.json());
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
);
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);

app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

// Routes
const categoriesRoutes = require('./routes/categories');
const ordersRoutes = require('./routes/orders');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);

// Database
mongoose
    .connect(process.env.CONNECTION_STRING, {
        dbName: process.env.DB_NAME,
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log(`We are using ${process.env.DB_NAME}...`);
    })
    .catch((err) => {
        console.error('Database connection error', err);
    });

const PORT = process.env.PORT || 3000;

// Server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        debug('HTTP server closed');
    });
});
