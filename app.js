var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var bp = require('body-parser');
var port = 2500;

var conf = require('./config.json');

app.set('views', __dirname + '/views');
app.set('viev_engine', 'ejs');

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.use(express.static(__dirname + '/static'));

http.createServer(app).listen(port, function(){
	console.log('Listening on port', port);
});
