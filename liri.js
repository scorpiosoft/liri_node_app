// commands liri understands
// * `spotify-this-song`
// * `movie-this`
// * `do-what-it-says`
// * `geocode`

// NOTE TO TRILOGY: I am a conscientious objector to social media.  I will not use personal assets to access social media.
//                  I have never had a Twiter account and I abandoned my Facebook account many years ago.
//                  I will not open even a fake Twitter account for a homework assignmnet.
//                  If this were an employer assigned task using employer owned assets I would have no problem complying.
//
//                  As such, I added 'geocode' as an alternate 4th command for LIRI.

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
// geocoder API
var geocoder = require("geocoder");

//
// Mainline Code
//

// store objects from keys.js in variables
var spotify = new Spotify(keys.spotify);

// command line arg processing
var args = process.argv.slice(2);
var command = args[0];
// assemble the title (or location)
var title = args.slice(1).join(' ');
// console.log('command:', command, 'title:', title);

// stuff for 'do-what-it-says'
var dwis_file = 'random.txt'

switch (command)
{
  case 'spotify-this-song':
    spotify_this_song(title);
    break;
  case 'movie-this':
    movie_this(title);
    break;
  case 'geocode':
    do_geocode(title);
    break;
  case 'do-what-it-says':
    fs.readFile(dwis_file, "utf8", function(error, data)
    {
      // log any errors
      if (error)
        return console.log(error);
      // console.log(data);
      // parse the command read from the file
      var dwis_arr = data.split(/, */);
      // console.log('dwis_arr:', dwis_arr);
      var dwis_command = dwis_arr[0];
      var dwis_title = dwis_arr[1];
      // remove all quotes and newlines in the title
      dwis_title = dwis_title.replace(/["'\n]/g, '');
      // console.log('dwis_command:', dwis_command, 'dwis_title:', dwis_title);

      switch(dwis_command)
      {
        case 'spotify-this-song':
          spotify_this_song(dwis_title);
          break;
        case 'movie-this':
          movie_this(dwis_title);
          break;
        case 'geocode':
          do_geocode(dwis_title);
          break;
        default:
          console.log("Unknown command:", dwis_command);
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
// If no song is provided then default to "The No-No Song" by Ringo Starr
function spotify_this_song(song)
{
  var i, j;
  var title = song;
  if (!validate_exists(title)) { title = 'No No Song'; }
  // console.log('title:', title);

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

// function movie_this
// log to terminal the following info about the passed in movie
// * Title of the movie
// * Year the movie came out
// * IMDB Rating of the movie
// * Rotten Tomatoes Rating of the movie
// * Country where the movie was produced
// * Language of the movie
// * Plot of the movie
// * Actors in the movie
// If no movie is provided then default to "Highlander"
function movie_this(movie)
{
  var title = movie;
  if (!validate_exists(title)) { title = 'Highlander'; }

  // Then run a request to the OMDB API with the movie specified
  var query = "http://www.omdbapi.com/?t=" + title.split(' ').join('+') + "&y=&plot=short&apikey=df7ba434";
  // console.log(query);
  // do the request
  request(query, function(error, response, body)
  {
    // If the request is successful (i.e. if the response status code is 200)
    if (!error && response.statusCode === 200)
    {
      var obj = JSON.parse(body);
      // DEBUG
      // console.log(JSON.parse(body, null, 2));
      // Actual Output
      console.log('Movie:', title);
      console.log('\tReleased:\t', obj.Released);
      var imbd_rating = '';
      var rt_rating = '';
      for (var i = 0; i < obj.Ratings.length; ++i)
      {
        switch (obj.Ratings[i].Source)
        {
          case 'Internet Movie Database':
            imdb_rating = obj.Ratings[i].Value;
            break;
          case 'Rotten Tomatoes':
            rt_rating = obj.Ratings[i].Value;
            break;
        }
      }
      console.log('\tIMDB Rating:\t', imdb_rating);
      console.log('\tRotten Tomatoes:', rt_rating);
      console.log('\tCountry:\t', obj.Country);
      console.log('\tLanguage:\t', obj.Language);
      console.log('\tPlot:\t\t', obj.Plot);
      console.log('\tActors: \t', obj.Actors);
    }
  });
}

// function geocode
// log to terminal the following info about the passed in location
// * formatted address
// * latitude
// * longitude
// If no movie is provided then default to "Brandenburg Gate"
function do_geocode(location)
{
  var loc = location;
  if (!validate_exists(loc)) { loc = 'Brandenburg Gate'; }

  geocoder.geocode(loc, function ( err, data )
  {
    // If there is an error log it.
    if (err)
    {
      console.log(err);
    }
    // DEBUG
    // console.log(JSON.stringify(data, null, 2));
    // Actual Output
    console.log('Location:', loc);
    console.log('\tAddress:   ', data.results[0].formatted_address);
    console.log('\tLatitude:  ', data.results[0].geometry.location.lat);
    console.log('\tLongitude: ', data.results[0].geometry.location.lng);
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
