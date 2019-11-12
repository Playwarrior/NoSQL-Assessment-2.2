const express = require('express');
const mongoose = require('mongoose');

const apiv1 = require('./routes/apiv1');

const connection = require('./connection').connectionString;

const app = express();

mongoose.connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

app.all('*', function (req, res, next) {
    next();
});

//ROUTES
app.use('/apiv1', apiv1);

function errorHandler(err, req, res, next) {
   res.status(500).json(err);
}

app.use(errorHandler);

mongoose.connection.once('open', () => {
    const port = 8080;
    app.listen(port, () => {
        console.log('Server is open!');
    });
}).on('error', (error) => {
    console.warn('Connection failed!', error);
});

