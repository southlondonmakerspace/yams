var express = require( 'express' )
	session = require( 'express-session' ),
	swig = require( 'swig' ),
	cookie = require('cookie-parser'),
	formBodyParser = require( 'body-parser' ).urlencoded( { extended: true } ),
	fs = require( 'fs' ),
	net = require( 'net' ),
	app = express(),
	http = require( 'http' ).Server( app );

var config = require( __dirname + '/config.json' );

var telnetServer = require( './telnet-server.js' );
var membership = require( './membership.js' );
var accessList = JSON.parse( fs.readFileSync( __dirname + '/access-list.json' ).toString() );

// Setup sessions
app.use( cookie() );
app.use( session( {
	secret: 'tools',
	cookie: { maxAge: 31*24*60*60*1000 },
	saveUninitialized: false,
	resave: false,
	rolling: true
} ) );

app.use( express.static( 'static' ) );

// Setup swig
app.engine( 'swig', swig.renderFile );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'swig' );
app.set( 'view cache', false );
swig.setDefaults( { cache: false } );

var server = net.createServer( telnetServer.createServer ).listen( config['telnet-port'], telnetServer.event.started );
telnetServer.event.client.data = function( buffer ) {
	var client = this.client;
	var tag = buffer.toString().trim();
	//console.log( buffer.toString() );
	// Device
	if ( client.device == undefined ) {
		if ( Object.keys( accessList ).indexOf( tag ) != -1 ) {
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
		if ( accessList[ client.device ].indexOf( tag ) != -1 ) {
			if ( response.valid && response.active ) {
				//console.log( 'valid tag' );
				valid( client );
			} else {
				//console.log( 'invalid member' );
				invalid( client );
			}
		} else {
			// Store for later
			if ( accessList[ 'new' ].indexOf( tag ) == -1 ) {
				accessList[ 'new' ].push( tag );
				savePermissions();
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

function loggedIn( req, res, next ) {
	if ( req.session.loggedIn != true ) {
		return res.redirect( '/' );
	}
	res.locals.loggedIn = true;
	next();
}

app.get( '/', function( req, res ) {
	if ( req.session.loggedIn == true ) {
		return res.redirect( '/access' );
	}
	res.render( 'index' );
} );

app.post( '/', formBodyParser, function( req, res ) {
	if ( accessList['admin'].indexOf( req.body.password ) != -1 ) {
		req.session.loggedIn = true;
		return res.redirect( '/access' );
	}
	res.redirect( '/' );
} );

app.get( '/logout', function( req, res ) {
	req.session.loggedIn = false;
	res.redirect( '/' );
} );

app.get( '/access', loggedIn, function( req, res ) {
	res.render( 'access', { permissions: Object.keys( accessList ), accessList: accessList } );
} );

app.get( '/view/:permission', loggedIn, function( req, res ) {
	res.render( 'view', { permission: req.params.permission, members: accessList[ req.params.permission ] } );
} );

app.post( '/view/:permission', [ loggedIn, formBodyParser ], function( req, res ) {
	if ( accessList[ req.params.permission ] != undefined ) {
		if ( accessList[ req.params.permission ].indexOf( req.params.member ) == -1 ) {
			accessList[ req.params.permission ].push( req.body.tag );
			savePermissions();
		}
	}
	res.redirect( '/view/' + req.params.permission );
} );

app.get( '/remove/:permission/:member', loggedIn, function( req, res ) {
	if ( accessList[ req.params.permission ] != undefined ) {
		if ( accessList[ req.params.permission ].indexOf( req.params.member ) != -1 ) {
			accessList[ req.params.permission ].splice( accessList[ req.params.permission ].indexOf( req.params.member ), 1 );
			savePermissions();
		}
	}
	res.redirect( '/view/' + req.params.permission );
} );

function savePermissions() {
	var json = JSON.stringify( accessList );
	fs.writeFile( __dirname + '/access-list.json', json, function( err ) {
		if ( err )
			console.log( err );
	} );
}

// Start server
var listener = app.listen( config['web-port'], 'localhost', function () {
	console.log( "Web server started on port: " + listener.address().port );
} );
