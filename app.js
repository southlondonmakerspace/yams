var express = require( 'express' )
	session = require( 'express-session' ),
	swig = require( 'swig' ),
	cookie = require('cookie-parser'),
	fs = require( 'fs' ),
	net = require( 'net' ),
	app = express(),
	http = require( 'http' ).Server( app );

var config = require( __dirname + '/config.json' );

var telnetServer = require( './telnet-server.js' );
var membership = require( './membership.js' );
var permissions = require( './permissions.js' )( __dirname + '/access-list.json' ).load();
var webServer = require( './webserver.js' )( permissions );

// Web Server
/////////////

// Setup sessions
app.use( cookie() );
app.use( session( {
	secret: 'tools',
	cookie: { maxAge: 31*24*60*60*1000 },
	saveUninitialized: false,
	resave: false,
	rolling: true
} ) );

// Setup static route
app.use( express.static( 'static' ) );

// Setup swig
app.engine( 'swig', swig.renderFile );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'swig' );
app.set( 'view cache', false );
swig.setDefaults( { cache: false } );

// Setup web server
app.use( '/', webServer );// Start server

var listener = app.listen( config['web-port'], function () {
	console.log( "Web server started on port: " + listener.address().port );
} );

// Tool Telnet Server
/////////////////////

var server = net.createServer( telnetServer.createServer ).listen( config['telnet-port'], telnetServer.event.started );

telnetServer.event.client.data = function( buffer ) {
	var client = this.client;
	var tag = buffer.toString().trim();
	//console.log( buffer.toString() );
	// Device
	if ( client.device == undefined ) {
		if ( permissions.deviceExists( tag ) ) {
			//console.log( 'valid device' );
			client.device = tag;
		} else {
			//console.log( 'invalid device' );
			invalid( client );
		}
		return;
	}

	// Tag
	membership.validate( tag, function( response ) {
		if ( permissions.check( client.device, tag ) ) {
			if ( response.valid && response.active ) {
				//console.log( 'valid tag' );
				valid( client );
			} else {
				//console.log( 'invalid member' );
				invalid( client );
			}
		} else {
			// Store for later
			if ( ! permissions.check( 'new', tag ) ) {
				permissions.grant( 'new', tag );
			}

			//console.log( 'invalid tag' );
			invalid( client );
		}
		//console.log( response );
	} );
}

function valid( client ) {
	client.write( '1' );
	client.end();
}

function invalid( client ) {
	client.write( '0' );
	client.end();
}
