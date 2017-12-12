# Angular2 Analytics Stream

This package adds the ability to stream various page events to a backend service for collecting analytics streams.

## Project structure
This plugin consists of two parts:

### Auxilliary tracking script
This script functions similarly to the Google Analytics tracking
scripts that are omni-present on the web.  It must be loaded as
high in your DOM as possible if you want to capture accurate page
load times.

The script should be loaded synchronously, and should be followed
by a configuration block.  For example:

```html
<script language="javascript" src="http://path.to/analyticsStream.js"/>
<script language="javascript">
analyticsStream.config({
	product: 'my-application',
	url: 'http://path.to/my/endpoint',
	sessionCookie: 'sessionId'
});
</script>
```

Then later down in your script you can track custom analytics by pushing
them into the stream:
```javascript
analyticsStream.push({
	eventLabel: 'next button',
	eventCategory: 'click'
});
```

The analytics package will automatically log page load time.  If you want to log
a page view event, call:
```javascript
analyticsStream.pageview();
```

You can also create convenient onclick wrappers for links or other page events:
```html
<a href="/my-page" onclick="return analyticsStream.pageevent('my link', 'link', 'click')">Link text</a>
```

### Angular2 Wrapper Components
These components can be injected into your Angular2 app to provide
support for tracking custom analytics as well as Angular lifecycle 
events. 
