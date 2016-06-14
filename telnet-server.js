var rl = require( 'readline' );

var client_id = 1;

var TelnetServer = {
	createServer: function( client ) {
		client.rl = rl.createInterface( client, client );
		client.rl.client = client;
		client.name = client_id++;
		console.log( '#' + client.name +'	Connected (' + client.remoteAddress + ')' );
		client.on( 'end', TelnetServer.event.client.disconnected );
		client.on( 'timeout', TelnetServer.event.client.timeout );
		client.rl.on( 'line', TelnetServer.event.client.data );
		client.on( 'error', TelnetServer.event.client.error );
		client.setTimeout( 2500 );
	},
	event: {
		started: function() {
			console.log( "Telnet server started on port: " + this.address().port );
		},
		client: {
			disconnected: function() {
				console.log( '#' + this.name + '	Disconnected' );
			},
			timeout: function() {
				console.log( '#' + this.name + '	Timed Out' );
				this.end();
			},
			error: function( error ) {
				if ( error.errno == 'ECONNRESET' ) {
					console.log( '#' + this.name + '	Error: Connection reset by client (hard disconnect)' );
				} else {
					console.log( '#' + this.name + '	Error: ', error );
				}
				this.end();
			},
			data: function( buffer ) {
				console.log( buffer.toString() );
			}
		}
	}
};

module.exports = TelnetServer;
