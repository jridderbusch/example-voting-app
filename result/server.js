const express = require('express'),
	async = require('async'),
		pg = require("pg"),
		path = require("path"),
		cookieParser = require('cookie-parser'),
		bodyParser = require('body-parser'),
		methodOverride = require('method-override'),
		app = express(),
		server = require('http').Server(app);

const port = process.env.PORT || 4000;
const options  = process.env.OPTIONS || "Cats,Dogs"
options = options.split(',')
var votes= {}


async.retry({times: 1000,interval: 1000}, (callback) => {
		pg.connect('postgres://postgres@db/postgres', (err, client, done) => {
			if (err) {
				console.error("Waiting for db");
			}
			callback(err, client);
		});
	},
	(err, client) => {
		if (err) {
			return console.error("Giving up");
		}
		console.log("Connected to db");
		getVotes(client);
	}
);

function getVotes(client) {
	client.query('SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote', [], (err, result) => {
		if (err) {
			console.error("Error performing query: " + err);
		} else {
			result.rows.forEach((row) => votes[row.vote] = parseInt(row.count))
      console.log(votes);
		}
		setTimeout(() => {
			getVotes(client)
		}, 3000);
	});
}


app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
	next();
});

app.use(express.static(__dirname + '/views'));

app.get('/', (req, res) => {
	res.sendFile(path.resolve(__dirname + '/views/index.html'));
});

app.get('/result', (req, res) => {
	res.json(votes)
})
app.get('/options', (req, res) => {
  res.json(options)
})

server.listen(port, () => {
	var port = server.address().port;
	console.log('App running on port ' + port);
});
