// commands liri understands
// * `spotify-this-song`
// * `movie-this`
// * `do-what-it-says`
// * `geocode`

require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var request = require('request');

// store objects from keys.js in variables
var spotify = new Spotify(keys.spotify);

// command line arguments
var args = process.argv.slice(2);

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
  var song = song;
  if (!validate_exists(song)) { song = 'No No Song'; }

  // search spotify for the song - the results are really off base, gotta leave the limit high to be reasonably sure of getting your song
  spotify.search({ type: 'track', query: song, limit: 20 })
  .then(function(response) {
    for (i = 0; i < response.tracks.items.length; ++i)
    {
      if (response.tracks.items[i].name === song)
      {
        // DEBUG
        // console.log(i, "artists:", response.tracks.items[i].artists);
        // console.log(i, "name:", response.tracks.items[i].name);
        // Actual Output
        console.log("Track:", song);
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

spotify_this_song(args[0]);

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
