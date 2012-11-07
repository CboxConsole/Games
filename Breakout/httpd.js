#!/usr/bin/env node

process.env.PORT = Number(process.argv[2] || 8081);
process.env.LOGGER = (process.argv[3]);

var url = require('url')
	, os = require("os")
	, express = require('express')
	, app = express();

if (process.env.LOGGER) app.use(express.logger());
app.use('/', express.static(__dirname + '/'));

app.listen(process.env.PORT, null);

console.log('STARTED SERVER WITH PORT ' + process.env.PORT);

