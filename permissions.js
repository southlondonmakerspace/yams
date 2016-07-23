var permissions = {};

var json_path = '';

permissions.list = {};

permissions.load = function() {
	permissions.list = JSON.parse( fs.readFileSync( json_path ).toString() );
	return permissions;
}

permissions.deviceExists = function( device ) {
	return Object.keys( permissions.list ).indexOf( device ) != -1;
}

permissions.grant = function( device, tag ) {
	if ( permissions.deviceExists( device ) && ! permissions.check( device, tag ) ) {
		permissions.list[ device ].push( tag );
		permissions.save();
	}
}

permissions.revoke = function( device, tag ) {
	if ( permissions.deviceExists( device ) && permissions.check( device, tag ) ) {
		var index = permissions.list[ device ].indexOf( tag );
		permissions.list[ device ].splice( index, 1 );
		permissions.save();
	}
}

permissions.check = function( device, tag ) {
	return permissions.list[ device ].indexOf( tag ) != -1;
}

permissions.devices = function() {
	return Object.keys( permissions.list );
}

permissions.device = function( device ) {
	return permissions.list[ device ];
}

permissions.save = function() {
	var json = JSON.stringify( permissions.list );
	fs.writeFile( json_path, json, function( err ) {
		if ( err )
			console.log( err );
		console.log( 'saved' );
	} );
}

module.exports = function( file ) {
	json_path = file;
	return permissions;
}
