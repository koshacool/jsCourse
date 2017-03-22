var API_URL = 'https://jsonplaceholder.typicode.com';
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

var printAlbums = function(albumsContainer) {   
    return function (albums) {
        albumsContainer.innerHTML = '';
        albums.forEach(function(album) {
            var photosContainer = document.createElement("ul");
            albumsContainer.innerHTML += '<h1>' + album.title + '</h1>';
            albumsContainer.appendChild(photosContainer);

            printPhotosLink(photosContainer, album.photos)
        });
  };
};


/* Get data from server by promises */
var toJson = function(res) {    
    return res.json();
};

var allToJson = function(responses) {
    return Promise.all(responses.map(toJson));
};

var addPhotosToAlbums = function (albums) {
    return function (photos) {
        return albums.map(function(album, i) {//Return new albums with photos
            album.photos = photos[i];
            return album;
        });
    };
};

var getAlbums = function (userId) {
    return fetch(API_URL + ALBUMS + '?userId=' + userId);
}

var getPhotos = function(album) {
    return fetch(API_URL + PHOTOS + '?albumId=' + album.id);
};

var combineWithPhotos = function(albums) {
  var photosRequests = albums.map(getPhotos);//Save all getted(getPhotos) promise to array
  
  return new Promise(function (resolve, reject) {
    Promise.all(photosRequests)//Wait for get all photo
      .then(allToJson)
      .then(addPhotosToAlbums(albums))
      .then(resolve)
      .catch(reject);
  });
};

var loadAlbumsWithPhotos = function(event) {
    event.preventDefault();
    
    var albumsContainer = document.getElementById('albums');
    var userId = document.getElementById('userId').value;
  
    getAlbums(userId)
        .then(toJson)
        .then(combineWithPhotos)
        .then(printAlbums(albumsContainer));
};

window.onload = function() {
   document.getElementById('findAlbums').onsubmit = loadAlbumsWithPhotos;
}
