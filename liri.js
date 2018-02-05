// commands liri understands
// * `spotify-this-song`
// * `movie-this`
// * `do-what-it-says`
// * `geocode`

//
// External Dependencies
//

// load .env file into provess.env object
require("dotenv").config();
// objects for API use
var keys = require("./keys.js");
// spotify API
var Spotify = require('node-spotify-api');
// XHR API
var request = require('request');
// file system package
var fs = require("fs");

//
// Mainline Code
//

// store objects from keys.js in variables
var spotify = new Spotify(keys.spotify);

// command line arg processing
var args = process.argv.slice(2);
var command = args[0];
// assemble the movie name, OMDB needs the '+'es between words
var title = args.slice(1).join(' ');
// console.log('command:', command, 'title:', title);

// stuff for 'do-what-it-says'
var dwis_file = 'random.txt'

spotify_this_song(args[0]);
switch (command)
{
  case 'spotify-this-song':
    spotify_this_song(title);
    break;
  case 'movie-this':
    // assemble the movie name, OMDB needs the '+'es between words
    var movie_title = args.slice(1).join('+');
    console.log('movie_title:', movie_title);
    movie_this(movie_title);
    break;
  case 'do-what-it-says':
    fs.readFile(dwis_file, "utf8", function(error, data)
    {
      // log any errors
      if (error)
        return console.log(error);
      console.log(data);
      // parse the command read from the file
      var dwis_arr = data.split(/, */);
      console.log('dwis_arr:', dwis_arr);
      var dwis_command = dwis_arr[0];
      var dwis_title = dwis_arr[1];
      dwis_title = dwis_title.replace(/["'\n]/g, '');
      console.log('dwis_command:', dwis_command, 'dwis_title:', dwis_title);

      switch(dwis_command)
      {
        case 'spotify-this-song':
          spotify_this_song(dwis_title);
          break;
        case 'movie-this':
          // assemble the movie name, OMDB needs the '+'es between words
          var movie_title = dwis_title.split(' ').join('+');
          console.log('movie_title:', movie_title);
          movie_this(movie_title);
          break;
        default:
          console.log("unknown operation:", op);
          return false;
      }
    });
    break;
  default:
    console.log('Unknown command:', command);
    return false;
}

//
// LIRI functions
//

// function spotify_this_song
// log to terminal the following info about the passed in song
// * Artist(s)
// * The song's name
// * A preview link of the song from Spotify
// * The album that the song is from
//
// If no song is provided then default to "The No-No Song" by Ringo Starr
function spotify_this_song(song)
{
  var i, j;
  var title = song;
  if (!validate_exists(title)) { title = 'No No Song'; }

  // search spotify for the song - the results are really off base, gotta leave the limit high to be reasonably sure of getting your song
  spotify.search({ type: 'track', query: title, limit: 20 })
  .then(function(response) {
    for (i = 0; i < response.tracks.items.length; ++i)
    {
      if (response.tracks.items[i].name === title)
      {
        // DEBUG
        // console.log(i, "artists:", response.tracks.items[i].artists);
        // console.log(i, "name:", response.tracks.items[i].name);
        // Actual Output
        console.log("Track:", title);
        var artists = "";
        for (j = 0; j < response.tracks.items[i].artists.length; ++j)
        {
          artists += response.tracks.items[i].artists[j].name + ", ";
        }
        var s = (response.tracks.items[i].artists.length == 1) ? ': ' : 's:';
        console.log("\tArtist"+s, artists.slice(0, -2));
        console.log("\tLink:\t", response.tracks.items[i].external_urls.spotify);
        console.log("\tAlbum:\t", response.tracks.items[i].album.name);
        console.log('');
      }
    }
    // console.log(JSON.stringify(response, null, 2));
  })
  .catch(function(err) {
    console.log(err);
  });
}

// If no movie is provided then default to "Highlander"
function movie_this(movie)
{
  var title = movie;
  if (!validate_exists(title)) { title = 'Highlander'; }

  // Then run a request to the OMDB API with the movie specified
  var query = "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=df7ba434";
  // console.log(query);
  // do the request
  request(query, function(error, response, body)
  {
    // If the request is successful (i.e. if the response status code is 200)
    if (!error && response.statusCode === 200)
    {
      console.log(JSON.parse(body, null, 2));
      console.log(args.slice(2).join(' '), "was released", JSON.parse(body).Released);
    }
  });
}

//
// Utility Functions
//

// validate that a variable exists
// if a string, verify a length of at least 1 character
// return true if above is true, otherwise false
function validate_exists(v)
{
  if ((typeof v == 'undefined') || v == null || (typeof v == 'string' && (v.length <= 0)))
  {
    return false;
  }
  return true;
}
