const express = require('express');
const bodyParser = require('body-parser');
const api = require('./api');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', api);

const port = process.env.PORT || 5000;

app.listen(port, function() {
	console.log('Express server listening on port ' + port);
});
