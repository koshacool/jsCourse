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

// var allToJson = R.pipe(//Have problem with using it
//   	R.map(toJson),
//   	R.bind(Promise.all, Promise)
// );

var getAlbums = R.pipe(
	R.concat(SERVER_URL + ALBUMS + '?userId='), 
	fetch
);

var getPhotos = R.pipe(
	R.prop('id'),
	R.concat(SERVER_URL + PHOTOS + '?albumId='), 
	fetch
);

var addPhotosToAlbum = R.set(R.lensProp('photos'));//Save photos in album

var addPhotosToAlbums = R.zipWith(addPhotosToAlbum);//For all albums save photos

var combineWithPhotos = function(albums) {
  var photosRequests = albums.map(getPhotos);//Save all getted(getPhotos) promise to array
  
  return new Promise(function (resolve, reject) {
	Promise.all(photosRequests)//Wait for get all photo
	  .then(allToJson)
	  .then(addPhotosToAlbums(R.__, albums))
	  .then(resolve)
	  .catch(reject);
  });
};

var loadAlbumsWithPhotos = function(event) {
	event.preventDefault();
	
	var dataContainer = document.getElementById('albums');
	var userId = document.getElementById('userId').value;
  
	getAlbums(userId)
		.then(toJson)
		.then(combineWithPhotos)
		.then(printAlbums(dataContainer));
};

window.onload = function() {
   document.getElementById('findAlbums').onsubmit = loadAlbumsWithPhotos;
};