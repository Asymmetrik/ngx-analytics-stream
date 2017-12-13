'use strict';
const { Server } = require('node-static');

const folder = new Server('./public', { cache: 0 });

require('http').createServer((req, res) => {
	if (req.url.match(/.*\.js/)) {
		res.setHeader('Content-Type', 'application/javascript');
	}
	else {
		res.setHeader('Content-Type', 'text/html');
	}

	req.addListener('end', () => {
		folder.serve(req, res);
	}).resume();
}).listen('8080');

console.log('Started server at http://localhost:8080');
