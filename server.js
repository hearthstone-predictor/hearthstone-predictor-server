var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs		   = require('fs');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 8080;        // set our port

var router = express.Router();

var cards = require('./all-cards.json');
var cardsVersion = cards.meta.version;

var decks = require('./decks.json');
var decksVersion = decks.meta.version;

router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

router.get('/cards/update', function(req, res) {
	var version = req.query.version;
	var result;
	if (version != cardsVersion) {
		result = cards;
	}else{
		result = {meta: {version: version}};
	}
 	res.json(result);
});

router.get('/decks/update', function(req, res) {
	var version = req.query.version;
	var result;
	if (version != cardsVersion) {
		result = decks;
	}else{
		result = {meta: {version: version}};
	}
 	res.json(result);
});

// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);
