# cs6331
multimedia semester project
qr code reading and overlaying the media in real-time
one of the more fun things is that websites and browsers will not allow:
- mixed requests (http + https)
- internal embedding of websites (x-frame options)
- consistent sizing (apple)
- cors existing (i know it's to prevent middleware attacks but...)

some polishing in the UI is required but goals from a technical perspective are:
- playing around with cocossd and transfer learning
- working with markers instead of qr codes (arjs?)
- utilizing tfjs since cocossd provides consistent 20fps
- experimenting with loading in images instead of websites

the current version now works like this:
	users the qrjs library to detect traditional qr codes
		very performant
	hit fastapi endpoint as a cors middleman
		phantomjs+mongoose does not have cors natively supported
	mongoose does all the network magic
	phantomjs combined with a custom script retrieves web data with some styling
		scripts and local resources break!
		the small size of the qr code overlay also breaks things!
