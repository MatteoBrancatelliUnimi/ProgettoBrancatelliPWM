const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
const scopes = ['user-read-email', 'user-read-private','playlist-read-collaborative','playlist-modify-public','playlist-read-private','playlist-modify-private','user-library-modify','user-library-read','user-top-read', 'user-read-playback-position','user-read-recently-played','user-follow-read','user-follow-modify'];
const client_id = "23305fca54214006893a401bee4acce3";
const secret = "cb15c9b6c04840079157cda7fbdc3a8c";
const uri = 'http://127.0.0.1:3000/callback';
const port = process.env.PORT || 3000

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

//set app credentials
var spotifyApi = new SpotifyWebApi({
	clientId: client_id,
	clientSecret: secret,
	redirectUri: uri
});

app.get('/', (req, res)=>{
	res.render('index', {title: 'Playlitic'});
});

var server = app.listen(port, ()=>{
	var host = server.address().address;
	var port = server.address().port;

	console.log('Applicazione in ascolto su http://%s%s\n', host, port);
});