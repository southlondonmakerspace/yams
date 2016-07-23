var app = require( 'express' )(),
	formBodyParser = require( 'body-parser' ).urlencoded( { extended: true } );

var permissions;

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
	if ( permissions.check( 'admin', req.body.password ) ) {
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
	res.render( 'access', { permissions: permissions.devices(), accessList: permissions.list } );
} );

app.get( '/view/:permission', loggedIn, function( req, res ) {
	res.render( 'view', { permission: req.params.permission, members: permissions.device( req.params.permission ) } );
} );

app.post( '/view/:permission', [ loggedIn, formBodyParser ], function( req, res ) {
	permissions.grant( req.params.permission, req.body.tag );
	res.redirect( '/view/' + req.params.permission );
} );

app.get( '/remove/:permission/:tag', loggedIn, function( req, res ) {
	permissions.revoke( req.params.permission, req.params.tag );
	res.redirect( '/view/' + req.params.permission );
} );

module.exports = function( p ) {
	permissions = p
	return app;
};
