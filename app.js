const express = require('express');
const mongoose = require('mongoose');

const apiv1 = require('./routes/apiv1');

const auth = require('./routes/auth');

const connection = require('./connection');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!connection.testing) {
	mongoose.connect(connection.connectionString, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true
	});
}

mongoose.connection
	.once('open', () => {
		console.log('Connection is open!');

		const port = process.env.PORT || 8080;
		app.listen(port, () => {
			console.log(`Server is open on port ${port}!`);
		});
	})
	.on('error', (error) => {
		console.warn('Connection failed!', error);
	});

app.all('*', function(req, res, next) {
	next();
});

//ROUTES
app.use('/apiv1', apiv1);
app.use('/auth', auth);

function errorHandler(err, req, res, next) {
	res.status(500).json({ error: err.message });
	console.error(err);
}

app.use(errorHandler);

module.exports = app;
