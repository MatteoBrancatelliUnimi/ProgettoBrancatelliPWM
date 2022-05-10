const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
const scopes = ['user-read-email', 'user-read-private','playlist-read-collaborative','playlist-modify-public','playlist-read-private','playlist-modify-private','user-library-modify','user-library-read','user-top-read', 'user-read-playback-position','user-read-recently-played','user-follow-read','user-follow-modify'];
const client_id = "23305fca54214006893a401bee4acce3";
const secret = "cb15c9b6c04840079157cda7fbdc3a8c";
const uri = 'http://127.0.0.1:3000/callback';
const port = process.env.PORT || 3000

const app = express();

var loggedUser = {};
var library = {};

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
	res.render('login', {title: 'Playlitic'});
});

app.get('/login', (req, res)=>{
	res.redirect(spotifyApi.createAuthorizeURL(scopes));
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

app.get('/search/:filter', (req, res)=>{
	let filter = req.params.filter;
	spotifyApi.search(filter, ['artist'],{limit: 10}).then(results => {
		res.send(results.body.artists);
	});
});

app.get('/getArtist/:id', (req, res)=>{
	let id = req.params.id;
	spotifyApi.getArtist(id).then(data => {
		res.send(data.body);
	});
});

app.get('/createPlaylist/:data', (req, res)=>{
	let input = JSON.parse(req.params.data);
	var id = '', playlistTracks = [];
	spotifyApi.createPlaylist(input.title, {description: input.description, collaborative: false, public: input.isPublic}).then(data => {
		id = data.body.id; //ID of the playlist
		console.log('Sono qui' + input); 
		return spotifyApi.getRecommendations({'seed_artists': input.artists, limit: input.numEl}).then(response => {
			return response.body;
		}).catch(err => {
			res.render('error', {message: 'Il problema è in getRecommendations', error: err});
		});
	}).then(results => {
		console.log(results);
		res.send(results);
	}).catch(err => {
		res.render('error', {message: 'Il problema è in createPlaylist', error: err});
	});;
}); 

var server = app.listen(port, ()=>{
	var host = server.address().address;
	var port = server.address().port;

	console.log('Applicazione in ascolto su http://%s%s\n', host, port);
});