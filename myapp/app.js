const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
//const base64url = require('base64url');
const bodyParser = require('body-parser');
const scopes = ['ugc-image-upload', 'user-read-email', 'user-read-private','playlist-read-collaborative','playlist-modify-public','playlist-read-private','playlist-modify-private','user-library-modify','user-library-read','user-top-read', 'user-read-playback-position','user-read-recently-played','user-follow-read','user-follow-modify'];
require('dotenv').config();

const client_id = process.env.CLIENT_ID;
const secret = process.env.SECRET;
const uri = process.env.URI;
const port = process.env.PORT || 3000;

const app = express();

var loggedUser = {};
var library = {};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
//set app credentials for logged users
var spotifyApi = new SpotifyWebApi({
	clientId: client_id,
	clientSecret: secret,
	redirectUri: uri
});
//set app credentials for not-logged users
var spotifyApiNoLogin = new SpotifyWebApi({
	clientId: client_id,
	clientSecret: secret
});

// Retrieve an access token.
spotifyApiNoLogin.clientCredentialsGrant().then(
	function(data) {
		//console.log('The access token expires in ' + data.body.expires_in);
		//console.log('The access token is ' + data.body.access_token);

		// Save the access token so that it's used in future calls
		spotifyApiNoLogin.setAccessToken(data.body.access_token);
	},
	function(err) {
		console.log('Something went wrong when retrieving an access token', err);
	}
);

app.get('/', (req, res)=>{
	res.render('index', {user: loggedUser, myItems: library});
});

app.get('/login', (req, res)=>{
	res.send(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/logout', (req, res)=>{
	loggedUser = {};
	library = {};
	res.send('Cleared');
});

//Callback function for Spotify
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

app.get('/homepage', (req, res)=>{

	spotifyApi.getMe().then(data => {
		loggedUser.me = data.body;
		
		return spotifyApi.getUserPlaylists(loggedUser.me.name).then(data => {
			return data.body;
		}).catch(err => {
			res.render('error', {message: 'Errore nel recuperare le tue playlists.', error: err});
		});
	})
	.then(playlists => {
		library.playlists = playlists;
		return spotifyApi.getFollowedArtists().then(data => {
			return data.body.artists;;
		}).catch(err => {
			res.render('error', {message: 'Errore nel recuperare i tuoi artisti.', error: err});
		});
	})
	.then(followedArtists => {
		library.artists = followedArtists;
		res.render('index', {user: loggedUser, myItems: library});
		//res.send(JSON.stringify({user: loggedUser, myItems: library}));
	})
	.catch(err => {
		res.render('error', {message: 'Errore nel recuperare i dati del tuo profilo.', error: err});
	});
});

app.get('/getCategories', (req, res) => {
	spotifyApi.getCategories({limit: 50, country: 'IT'}).then(data => {
		let catList = data.body.categories;
		res.render('categories', {user: loggedUser, list: catList});
	})
	.catch(err => {
		res.render('error', {message: 'Errore nel recuperare le categorie di Spotify.', error: err});
	});
});

app.get('/searchPlaylists/:id', (req, res)=>{
	let id = req.params.id;
	spotifyApi.getPlaylistsForCategory(id, {country: 'IT'})
	.then(data => {
		res.send(data.body.playlists);
	});
});

app.get('/more/:idPlaylist', (req, res)=>{
	var idPlaylist = req.params.idPlaylist;
	spotifyApi.getPlaylist(idPlaylist).then(data => {
		isInMyLibrary(idPlaylist, 'playlist').then(result => {
			if(result){
				res.render('item', {user: loggedUser, playlist: data.body, isPresent: true});
			}else{
				res.render('item', {user: loggedUser, playlist: data.body, isPresent: false});
			}
		});
		//console.log(data.body.tracks.items[0].track.name);
	})
	.catch(err => {
		res.render('error', {message: 'Errore nel recuperare la playlist.', error: err});
	});
});

app.get('/savePlaylist/:id', (req, res)=>{
	const idPlaylist = req.params.id;
	spotifyApi.followPlaylist(idPlaylist).then(data => {
		res.send(data);
	})
	.catch(err => {
		res.render('error', {message: 'Problema nell\'aggiungere la playlist alla tua libreria. Riprova più tardi.', error: err});
	});
});

//return true if an item is saved in user's library, false otherwise
function isInMyLibrary(id, type){
	if(type == 'playlist'){
		return spotifyApi.getUserPlaylists().then(data => {
			for(i=0; i<data.body.total; i++){
				if(id === data.body.items[i].id)
					return true;
			}
			return false;
		});
	}
}

app.get('/create', (req,res)=>{
	res.render('create', {user: loggedUser});
});

app.get('/search/:filter/:type', (req, res)=>{
	const filter = req.params.filter;
	const type = req.params.type;
	spotifyApiNoLogin.search(filter, [type]).then(results => {
		res.send(results.body);
	});
});

app.get('/getArtist/:id', (req, res)=>{
	let id = req.params.id;
	spotifyApi.getArtist(id).then(data => {
		res.send(data.body);
	});
});

app.get('/createPlaylist/:data', (req, res)=>{
	var input = JSON.parse(req.params.data);
	var id = '', playlistTracks = [];
	//console.log(input);
	spotifyApi.createPlaylist(input.title, {'description':input.description, 'public':input.isPublic}).then(data => {
		//console.log(input.artists);
		return id = data.body.id;
	}).then(id => {
		console.log(input.numElem);
		return spotifyApi.getRecommendations({'limit': input.numElem, 'seed_artists': input.artists}).then(data => {
			let tracks = data.body.tracks;
			tracks.forEach(track => {
				playlistTracks.push(track.uri);
			}); 
			return playlistTracks;
		}).catch(err => {
			console.log('Errore nel recuperare il contenuto ' + err);
		});
	}).then(array => {
		return spotifyApi.addTracksToPlaylist(id, array).then(data => {
			return data;
		}).catch(err => {
			console.log('errore nell\'aggiungere le tracce alla playlist');
		});
	}).then((data)=>{
		if(data.statusCode === 201){
			res.send(data);
		}
	}).catch(err => {
		console.log('Errore nel creare la playlist ' + err);
	});
}); 

function isUserLogged(){
	return loggedUser.me === undefined ? false : true;
}

app.get('/discover', (req, res)=>{
	res.render('discover', {user: loggedUser});
});


var server = app.listen(port, ()=>{
	var host = server.address().address;
	var port = server.address().port;

	console.log('Applicazione in ascolto su http://%s%s\n', host, port);
});