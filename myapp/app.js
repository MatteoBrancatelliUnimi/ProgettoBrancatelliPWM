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

app.get('/callback', (req, res)=>{
	const error = req. query.error;
	const code = req.query.code;
	const state = req.query.state;

	if(error){
		console.error('Errore nella chiamata di callback: ', error);
		res.render('error', {message: 'Errore nella chiamata di callback', error: error});
		return;
	}

	spotifyApi.authorizationCodeGrant(code)
	.then(data => {
		let access_t = data.body.access_token;
		let refresh_t = data.body.refresh_token;
		let expires_in = data.body.expires_in;

		spotifyApi.setAccessToken(access_t);
		spotifyApi.setRefreshToken(refresh_t);
		res.redirect('/homepage');

		//Refresh access token
		setInterval(async () => {
			let data = await spotifyApi.refreshAccessToken();
			let access_token = data.body.access_token;
		}, expires_in / 2 * 1000);
	})
	.catch(err => {
		console.error('Errore nell\'ottenere i token: ', err);
		res.render('error', {message: 'Errore nell\'ottenere i token', error: err});
	});
});

var server = app.listen(port, ()=>{
	var host = server.address().address;
	var port = server.address().port;

	console.log('Applicazione in ascolto su http://%s%s\n', host, port);
});