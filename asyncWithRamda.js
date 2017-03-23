var SERVER_URL = 'https://jsonplaceholder.typicode.com';
var ALBUMS = '/albums';
var PHOTOS = '/photos';

/* Display data */
var printPhotosLink = function(photosContainer, photos) {
	photos.forEach(function(photo) {
		var link = document.createElement("a");
		link.setAttribute('href', photo.thumbnailUrl);
		link.innerHTML = photo.title;

		var li = document.createElement("li");    
		li.appendChild(link);
	
		photosContainer.appendChild(li);
	});
}

var printAlbums = R.curry(function(albumsContainer, albums) {    
	albumsContainer.innerHTML = '';
	albums.forEach(function(album) {
		var photosContainer = document.createElement("ul");
		albumsContainer.innerHTML += '<h1>' + R.toUpper(album.title) + '</h1>';
		albumsContainer.appendChild(photosContainer);

		printPhotosLink(photosContainer, album.photos);//Add links to container
	});  
});


/* Get data from server by promises */
var toJson = R.invoker(0, 'json'); 

var allToJson = function(responses) {
	return Promise.all(responses.map(toJson));
};

var getAlbums = async function (userId) {
  	try {    	
		return await (R.pipe(
			R.concat(SERVER_URL + ALBUMS + '?userId='), 
			fetch
		))(userId);		
  	} 
  	catch (error) {
    	console.log(error);
  	}
}

var getPhotos = async function (album) {
  	try {    	
		return  await (R.pipe(
			R.prop('id'),
			R.concat(SERVER_URL + PHOTOS + '?albumId='), 
			fetch
		))(album);		
  	} 
  	catch (error) {
    	console.log(error);
  	}
}

var addPhotosToAlbum = R.set(R.lensProp('photos'));//Save photos in album

var addPhotosToAlbums = R.zipWith(addPhotosToAlbum);//For all albums save photos

var combineWithPhotos = async function(albums) {
 	var photosRequests = albums.map(getPhotos);//Save all getted(getPhotos) promise to array   
  	var all = Promise.all.bind(Promise);
	
	try {
    	var photos = await all(photosRequests);
		var jsonPhotos = await allToJson(photos);
		var albumsWithPhotos = await addPhotosToAlbums(jsonPhotos, albums);
		return albumsWithPhotos;		
  	} 	
  	catch (err) {
    	console.log('ERROR: ', err);
  	}
};

var loadAlbumsWithPhotos = async function(event) {
	event.preventDefault();
	
	var dataContainer = document.getElementById('albums');
	var userId = document.getElementById('userId').value; 

	try {
    	var albums = await getAlbums(userId);
		var jsonAlbums = await toJson(albums);
		var albumsWithPhotos = await combineWithPhotos(jsonAlbums);
		printAlbums(dataContainer, albumsWithPhotos); 
  	} 	
  	catch (err) {
    	console.log('ERROR: ', err);
  	}
};

window.onload = function() {
   document.getElementById('findAlbums').onsubmit = loadAlbumsWithPhotos;
};