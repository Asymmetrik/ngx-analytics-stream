# AngularX Analytics Stream

This package adds the ability to stream various page events to a backend service
for collecting analytics streams.

## Project structure
This plugin consists of two parts, an auxilliary tracking script that creates a
global tracker object, and an Angular wrapper that uses the tracker to capture
Angular lifecycle events.

### Auxilliary tracking script
This script functions similarly to the Google Analytics tracking
scripts that are omni-present on the web.  It must be loaded as
high in your DOM as possible if you want to capture accurate page
load times.

The script should be loaded synchronously, and should be followed
by a configuration block.  For example:

```html
<script language="javascript" src="http://path.to/analyticStream.js"/>
<script language="javascript">
analyticStream.config({
	product: 'my-application',
	url: 'http://path.to/my/endpoint',
	sessionCookie: 'sessionId'
});
</script>
```

Then later down in your script you can track custom analytics by pushing
them into the stream:
```javascript
analyticStream.push({
	eventLabel: 'next button',
	eventCategory: 'click'
});
```

The analytics package will automatically log page load time.  If you want to log
a page view event, call:
```javascript
analyticStream.pageview();
```

You can also create convenient onclick wrappers for links or other page events:
```html
<a href="/my-page" onclick="return analyticStream.pageevent('my link', 'link', 'click')">Link text</a>
```

### Angular2 Wrapper Components
These components can be injected into your Angular2 app to provide
support for tracking custom analytics as well as Angular lifecycle 
events. 

## DataLayer Architecture
The analytics tracking format is based around a DataLayer model, similar to Google Analytics' architecture.
Each "layer" contains a set of key/value pairs that represent part of the page state at a given point in time.
By assembling a collection of layers it is possible to recreate the full state of the object and see how that
state changed over time. Data layer objects can represent deeply-nested state, either by passing objects as the
values, or by using JSONPath-style keys that use dot notation.  For example, the following two payloads represent
the same state at two points in time.

```javascript
analyticStream.push({
	'eventLabel': 'pageview',
	'eventCategory': 'pageview',
	'eventValue': {
		'page': {
			'hostname': 'www.starwarsfacts.com',
			'path': '/jedi'
		},
		'client.ip': '123.45.67.89',
		'search': { 
			'keywords': 'obi wan'
		}
	}
});
```
```javascript
analyticStream.push({
	'eventLabel': 'pageview',
	'eventCategory': 'pageview',
	'eventValue': {
		'page.path': '/sith',
		'search.keywords': 'darth maul'
	}
});
```
Note that any state provided by the first payload that did not change does not need to be included in the second payload.
See Google's documentation for their Data Layer Helper to see how keys can be used to override previous state. https://github.com/google/data-layer-helper

Each payload represents a discreet browser event, either driven by the user or the application.
Each event has a label, which represents the specific event, and a category, which can be used to group
together classes of similar events.  In addition, each event can include any number of key/value pairs that represent
any changes that occurred to the state as a result of the event.  For example, an event that represents a user
changing the value in a selection box would send the new value of the box
