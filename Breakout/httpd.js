#!/usr/bin/env node

process.env.PORT = Number(process.argv[2] || 8081);
process.env.LOGGER = (process.argv[3]);

var url = require('url')
	, os = require("os")
	, qs = require('querystring')
	, express = require('express')
	, app = express();

app.enable("jsonp callback", true);
app.set("view options", {layout: false});
app.engine('.html', require('ejs').renderFile);

if (process.env.LOGGER) app.use(express.logger());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
	secret: 'skjghskdjfhbqigohqdiouk',
	store: new express.session.MemoryStore
}));
app.use('/', express.static(__dirname + '/'));
app.use('/libs', express.static(__dirname + '/libs'));
app.use('/db', express.static(__dirname + '/db'));


// INFORMATION
app.get('/var', function(req, res) {
	var v = {};
	switch (req.query.name) {
		case 'env':
			v = process.env;
			break;
		case 'os': 
			v = {platform:os.platform(),
				nic:os.networkInterfaces(),
				hostname:os.hostname(),
				uptime:os.uptime(),
				loadavg:os.loadavg(),
				freemem:os.freemem(),
				cpus:os.cpus(),
				arch:os.arch()
			}
			break;
	}

	res.send(v);	
});

app.listen(process.env.PORT, null);

console.log('STARTED SERVER WITH PORT ' + process.env.PORT);

