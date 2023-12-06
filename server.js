"use strict";
var page = require('webpage').create();
var server = require('webserver').create();
var system = require('system');
//var cors = require('cors');
var host, port;

if (system.args.length !== 2) {
    console.log('Usage: server.js <some port>');
    phantom.exit(1);
} else {
    port = system.args[1];
    var listening = server.listen(port, function (request, response) {
        console.log("GOT HTTP REQUEST");
        //console.log(JSON.stringify(request, null, 4));
	if(request.url.indexOf("http") == -1 || request.url.length < 8) {
	    console.log("not forwarding");
	    response.closeGracefully();	
	    return;
	}
	/*
	var url = "http://www.youtube.com";
	
	if(request.method !== 'GET') {
	    url = request.post.url;
	}
	*/
	var url;
	var query = request.url.split("?")[1];
	//console.log(query);
	if(query.length > 0) {
		url = query;
	}
	  
	//response.setHeader('Access-Control-Allow-Origin', "*");
	//response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	//response.setHeader('Access-Control-Allow-Headers', 'Content-Type');	
	response.headers = {"Cache": "no-cache", "Content-Type": "text/html", };

        console.log("SENDING REQUEST TO: " + url);
        page.open(url, function (status) {
		if (status !== 'success') {
		    console.log('FAIL to load the address');
		    response.statusCode = 400;
		    response.write(page.content);
		} else {
		    console.log('GOT data from the address');
		    // we set the headers here
		    response.statusCode = 200;
		    // now we write the body
		    // note: the headers above will now be sent implictly
		    response.write(page.content);
		    // note: writeBody can be called multiple times
		    // response.write("<body><p>pretty cool :)</body></html>");
		    //setTimeout(() => {response.close()}, 1000);
		    response.close();
		}
	});
    });
    if (!listening) {
        console.log("could not create web server listening on port " + port);
        phantom.exit();
    }
}
