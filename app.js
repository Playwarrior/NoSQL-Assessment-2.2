const express = require('express');
const mongoose = require('mongoose');

const logger = require('tracer').dailyfile({
	root: './logs',
	maxLogFiles: 10,
	allLogsFileName: 'studdit-app',
	format: '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})',
	dateformat: 'HH:MM:ss.L'
});

const apiv1 = require('./routes/apiv1');

const auth = require('./routes/auth');

const connection = require('./connection').connectionString;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(connection, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
});

mongoose.connection
	.once('open', () => {
		console.log('Connection is open!');
		logger.log('Connection is open');
	})
	.on('error', (error) => {
		console.warn('Connection failed!', error);
		logger.error(`Connection failed: ${error}`);
	});

app.all('*', function(req, res, next) {
	next();
});

//ROUTES
app.use('/apiv1', apiv1);
app.use('/auth', auth);

function errorHandler(err, req, res, next) {
	res.status(500).json(err);
}

app.use(errorHandler);

const port = 8080 || process.env.PORT;
app.listen(port, () => {
	console.log(`Server is open on port ${port}!`);
	logger.log(`Server is up and running on port ${port}`);
});
