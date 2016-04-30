var http = require("http");
var url = require("url");
var requestHandlers = require("./requestHandlers");
function start() {

	var express = require('express');
	app = express();
	var bodyParser = require('body-parser')
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	})); 
	var json = require('express-json');
	app.use(json())

	//app.use(express.static(__dirname + '/js'));
	//app.use(express.static(__dirname + '/inc'));
	//app.use(express.static(__dirname + '/inc'));
	app.use('/js', express.static('js'));
	app.use('/inc', express.static('inc'));
	

	app.get('/', function (req, res) {
		res.sendFile(__dirname + '/html/index.html')
	});
	app.get('/listRooms',requestHandlers.listRooms)
	app.get('/test', requestHandlers.test);
	var port = 8080;
	if(process.platform == "linux"){
		port = 80
	}

	var server = app.listen(port);
	
	requestHandlers.initializeSockets(server);
	
	



	
	console.log("Server has started");
}

exports.start = start;