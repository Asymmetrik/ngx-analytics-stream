/* eslint-env browser */

(function(global) {
	'use strict';

	/**
	 * @type {{url: string, sessionCookie: string, product: string}}
	 */
	const conf = {
		url: null,
		sessionCookie: null,
		product: null
	};

	/**
	 * Track page load time
	 * @type {Date}
	 */
	const startTime = new Date();

	global.onload = () => {

		// If there are already onload events, trigger them first
		if (global.onload) global.onload();

		// Calculate the page load time
		let loadTime = new Date().getMilliseconds() - startTime.getMilliseconds();

		// Now push a page load analytics event
		push({
			eventLabel: 'onload',
			eventCategory: 'page load',
			eventValue: {
				'page.loadTime': loadTime
			}
		});
	};

	/**
	 * Configure the analytics stream.  Call this as soon as the script tag has loaded
	 *
	 * @param {string} obj.url - The URL of the analytics endpoint.
	 * @param {string} obj.sessionCookie - The name of the cookie storing the user session. If this cookie
	 *     doesn't exist it will be created.
	 * @param {string} obj.product - The name of the product or site being tracked, to differentiate from
	 *     other sites using the same tracking endpoint.
	 *
	 * @returns {{url: string, sessionCookie: string, product: string}} The configuration object
	 */
	function config(obj) {
		// Sanitize keys
		if (obj.url) {
			conf.url = obj.url;
		}
		if (obj.sessionCookie) {
			conf.sessionCookie = obj.sessionCookie;
		}
		if (obj.product) {
			conf.product = obj.product;
		}
		return conf;
	}

	function getSessionId() {
		// TODO Implement this
	}

	/**
	 * Pushes a payload to the analytics endpoint.
	 *
	 * @param {Object} payload - The payload to send, containing the following keys:
	 * @param {string} payload.eventLabel - A name for the event that occurred
	 * @param {string} payload.eventCategory - The type of event that occurred
	 * @param {Object} payload.eventValue - A set of key/value pairs that capture current page state.
	 *     These will be sent to the data layer
	 * @param {string=} payload.classification - PHI, FOUO, etc.  Can be null or missing
	 * @param {string=} payload.product - The product to log data for (defaults to product in config)
	 * @param {string=} payload.sessionId - The user's session ID (defaults to session ID from cookie)
	 * @param {number=} payload.timestamp - The current timestamp
	 */
	function push(payload) {
		if (!payload.product) {
			payload.product = conf.product;
		}
		if (!payload.sessionId) {
			payload.sessionId = getSessionId();
		}
		if (!payload.timestamp) {
			payload.timestamp = new Date().getMilliseconds();
		}

		// If there is a Google Analytics datalayer and this payload is not classified, push it there too
		if (global.datalayer && !payload.classification) {
			// TODO Format the payload appropriately
			global.datalayer.push(payload);
		}

		// Dispatch an event to the global object to allow other plugins to interact with the data.
		// TODO Create a shim for this that also works in IE
		if (global.dispatchEvent && global.CustomEvent) {
			const event = new global.CustomEvent('push.analyticsStream', {
				detail: payload,
				cancelable: false,
				bubbles: false
			});
			global.dispatchEvent(event);
		}

		// TODO Do this in batches
		send(payload);
	}

	function send(payload) {
		if (conf.url) {
			// Create an unadorned AJAX request. There's no need to wait for a response.
			let req = new XMLHttpRequest();
			req.addEventListener('error', function(err) { console.log(err); });
			req.open('GET', conf.url);
			req.send();
		}
	}

	/**
	 * Tracks a pageview and sends all the appropriate properties
	 * @param path
	 */
	function pageview(properties) {
		// TODO Implement this
	}

	/**
	 * Returns a click-tracking function that can be added to any link tag, for convenience.
	 *
	 * `<a href="/my-link" onclick="analyticsStream.pagevent("my link", "link", "click")">Link</a>`
	 *
	 * @param {string=} label The event label
	 * @param {string=} category The event category
	 * @param {Object=} values Any values to transmit with this click event
	 * @returns {Function}
	 */
	function pageevent(label, category, values) {
		return function(event) {
			push({
				eventLabel: label,
				eventCategory: category,
				eventValue: values
			});
			return true;
		}
	}

	/**
	 * Registers a global object that can send analytics events
	 *
	 * @type {{config: config, push: push, pageview: pageview, pageevent: pageevent}}
	 */
	global.analyticsStream = {
		config: config,
		push: push,
		pageview: pageview,
		pageevent: pageevent
	};

})(window);
