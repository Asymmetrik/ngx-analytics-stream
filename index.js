'use strict';
const path = require('path');

/**
 * @file
 * This file provides an ExpressJS controller that returns the analyticStream.js file, which you can inject into your application.
 */

/**
 * An express controller that serves up the analyticStream.js file built by this package.
 *
 * @param {http.request} req
 * @param {http.response} res
 */
module.exports.expressController = function(req, res) {
	try {
		res.setHeader('Content-Type', 'application/javascript');
		const stream = fs.createReadStream(path.resolve('./public/dist/analyticStream.js'));
		stream.pipe(res);
	}
	catch (err) {
		console.log('Failed to load analyticStream.js:' + err.message);
		res.status(403).send();
	}
};

/**
 *
 *
 * @param {express.app} app
 * @param {string} route
 */
module.exports.addExpressController = function(app, route = '/analyticStream.js') {
	// Expose the analytics javascript
	app.route(route)
		.get(module.exports.expressController);
};
