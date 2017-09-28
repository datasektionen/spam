var express = require('express');
var bodyParser = require('body-parser');
var api = require('./api');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', api);

var port = process.env.PORT || 5000;

app.listen(port, function() {
	console.log('Express server listening on port ' + port);
});
