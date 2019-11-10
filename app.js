const express = require('express');
const mongoose = require('mongoose');

const connection = require('./connection').connectionString;

const app = express();

mongoose.connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

mongoose.connection.once('open', () => {
   console.log('Connection is open!');
}).on('error', (error) => {
   console.warn('Connection failed!', error);
});

app.all('*', function (req, res, next) {
    next();
});

//ROUTES
//app.use('/apiv1', apiv1);

const port = 8080;
app.listen(port, () => {
   console.log('Server is open!');
});
