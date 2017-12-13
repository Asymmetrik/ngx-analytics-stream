'use strict';

/* eslint-env browser */

(function (window, document) {
	'use strict';

	/**
  * @type {{url: string, sessionCookie: string, product: string}}
  */

	var conf = {
		url: null,
		sessionCookie: null,
		product: '',
		skipPageView: false
	};

	/**
  * Track page load time
  * @type {Date}
  */
	var startTime = new Date();

	var prevOnLoad = window.onload;
	window.onload = function () {

		// If there are already onload events, trigger them first
		if (prevOnLoad) prevOnLoad();

		// Initialize the session ID
		_getSessionId();

		// Calculate the page load time
		var loadTime = new Date().getTime() - startTime.getTime();

		// Now push a page load analytics event
		push({
			eventLabel: 'onload',
			eventCategory: 'page load',
			eventValue: {
				'page.loadTime': loadTime
			}
		});

		// Now push a page view event, unless we've explicitly asked not to
		if (!conf.skipPageView) {
			pageview();
		}
	};

	/**
  * Track the user's session ID from a cookie
  * @type {string|null}
  */
	var sessionId = null;
	function _getSessionId() {
		// Get the session ID cookie
		if (!sessionId && conf.sessionCookie && document.cookie) {
			sessionId = document.cookie.split('; ')
			// Split each cookie into key, value
			.map(function (cookie) {
				return cookie.split('=');
			})
			// Only get the cookie with the key we're looking for
			.filter(function (cookiepair) {
				return cookiepair[0] === conf.sessionCookie;
			})
			// Only return the value, not the key
			.map(function (cookiepair) {
				return cookiepair[1];
			}).shift();
		}
		// If there isn't a session ID cookie yet, create one
		if (!sessionId && conf.sessionCookie && window.btoa && Math.random) {
			sessionId = window.btoa(conf.product + Math.random());
			document.cookie = conf.sessionCookie + '=' + encodeURIComponent(sessionId);
		}
	}

	/**
  * Sets a key/value pair, unless a value is already set for the key.
  * This checks both JSONPath-style keys and also nested objects
  *
  * @param {Object} data - The object in which to set the key
  * @param {string} key - The key to check, which could include dots between pieces
  * @param {Object} defaultValue - The value to set unless the key already exists
  * @returns {Object} The current value of the key
  * @private
  */
	function _set(data, key, defaultValue) {
		if (!data || !key) {
			return undefined;
		}
		var hasKey = key.split('.').reduce(function (acc, keypart) {
			if (!acc[keypart]) {
				return undefined;
			}
			return acc[keypart];
		}, data);

		if (hasKey !== undefined) {
			return hasKey;
		}

		// Since we couldn't find the key, set it to the default value
		data[key] = defaultValue;
		return data[key];
	}

	/**
  * Configure the analytics stream.  Call this as soon as the script tag has loaded
  *
  * @param {string} obj.url - The URL of the analytics endpoint.
  * @param {string} obj.sessionCookie - The name of the cookie storing the user session. If this cookie
  *     doesn't exist it will be created.
  * @param {string} obj.product - The name of the product or site being tracked, to differentiate from
  *     other sites using the same tracking endpoint.
 *     @param {boolean} obj.skipPageView - If set to true, a pageview event will not immediately be sent
  *     once the page loads. If false or omitted, a pageview will be sent.
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
		if (obj.skipPageView) {
			conf.skipPageView = obj.skipPageView;
		}
		return conf;
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
		_set(payload, 'product', conf.product);
		_set(payload, 'sessionId', sessionId);
		_set(payload, 'timestamp', new Date().getTime());

		// If there is a Google Analytics datalayer and this payload is not classified, push it there too
		if (window.datalayer && !payload.classification) {
			// TODO Format the payload appropriately
			window.datalayer.push(payload);
		}

		// Dispatch an event to the window object to allow other plugins to interact with the data.
		// TODO Create a shim for this that also works in IE
		if (window.dispatchEvent && window.CustomEvent) {
			var event = new window.CustomEvent('push.analyticStream', {
				detail: payload,
				cancelable: false,
				bubbles: false
			});
			window.dispatchEvent(event);
		}

		// TODO Do this in batches
		send(payload);
	}

	function send(payload) {
		if (conf.url) {
			var str = JSON.stringify(payload);

			// Create an unadorned AJAX request. There's no need to wait for a response.
			var req = new XMLHttpRequest();
			req.addEventListener('error', function (err) {
				console.log(err);
			});
			req.open('POST', conf.url);
			req.setRequestHeader('Content-type', 'application/json');
			req.send(str);
		}
	}

	/**
  * Tracks a pageview and sends all the appropriate properties
  * @param {Object} properties - Any additional properties to capture
  */
	function pageview(properties) {
		// Automatically pull in the current page URL
		_set(properties, 'page', {});
		_set(properties, 'page.host', window.location.host);
		_set(properties, 'page.pathname', window.location.pathname);
		_set(properties, 'page.query', window.location.search);
		_set(properties, 'page.hash', window.location.hash);

		push({
			eventLabel: 'pageview',
			eventCategory: 'page load',
			eventValue: properties
		});
	}

	/**
  * Returns a click-tracking function that can be added to any link tag, for convenience.
  *
  * `<a href="/my-link" onclick="analyticStream.pagevent("my link", "link", "click")">Link</a>`
  *
  * @param {string=} label The event label
  * @param {string=} category The event category
  * @param {Object=} values Any values to transmit with this click event
  * @returns {Function}
  */
	function pageevent(label, category, values) {
		return function (event) {
			push({
				eventLabel: label,
				eventCategory: category,
				eventValue: values
			});
			return true;
		};
	}

	/**
  * Registers a global object that can send analytics events
  *
  * @type {{config: config, push: push, pageview: pageview, pageevent: pageevent}}
  */
	window.analyticStream = {
		config: config,
		push: push,
		pageview: pageview,
		pageevent: pageevent
	};
})(window, document);
//# sourceMappingURL=analyticStream.js.map
