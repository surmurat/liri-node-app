require("dotenv").config();
var keys = require('./keys');
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require('fs');
var spotify = new Spotify(keys.spotify);

var processArguments = process.argv;

if (processArguments.length === 2) {
    console.log('Invalid Command');
    showHelp();
    return;
}
var args = processArguments.slice(3, processArguments.length).join(" ");
RunLiri(processArguments[2], args);
function RunLiri(command, arguments)
{
    switch (command) {
        case 'concert-this':
            if (arguments.length < 4) {
                console.log('Not Enough Arguments');
                showHelp();
                return;
            }
            searchConcert(arguments);
            break;
        case 'spotify-this-song':
            if (arguments.length < 4) {
                console.log('Not Enough Arguments');
                showHelp();
                return;
            }
            playSpotify(arguments);
            break;
        case 'movie-this':
            if (arguments.length < 4) {
                console.log('Not Enough Arguments');
                showHelp();
                return;
            }
            findMovie(arguments);
            break;
        case 'do-what-it-says':
            whatSays();
            break;
        default:
            console.log("i don't know what do you want me to do!");
            return;
    }
}

function showHelp() {
    console.log('Please Use One of the Following:');
    console.log('concert-this <artist/band name here>');
    console.log("spotify-this-song '<song name here>'");
    console.log("movie-this '<movie name here>'");
    console.log("do-what-it-says '<command here>");
}

function searchConcert(band) {
    console.log(band);
}

function playSpotify(song) {
    spotify.search({ type: 'track', query: song })
        .then(function (response) {
            for (let i = 0; i < response.tracks.items.length; i++) {
                const element = response.tracks.items[i];
                var artists = '';
                if (element.artists.length === 1) {
                    artists = element.artists[0].name;
                } else {
                    for (let index = 0; index < element.artists.length; index++) {
                        if (artists === '') {
                            artists = element.artists[index].name;
                        }
                        else {
                            artists = artists.concat(" & ", element.artists[index].name);
                        }
                    }
                }
                console.log('Artist(s): ' + artists);
                console.log('Song: ' + element.name);
                console.log('Album: ' + element.album.name);
                console.log('Preview Url: ' + element.preview_url);
                console.log(' ');
            }
        })
        .catch(function (err) {
            console.log('There was an Error while trying to access spotify! ' + err);
        });
}

function findMovie(movie) {
    request.get('http://www.omdbapi.com/?apikey=' + keys.omdb.key + '&t=' + movie, null, function (err, httpResponse, body) {
        var response = JSON.parse(body);
        console.log('Title: ' + response.Title);
        console.log('Released: ' + response.Released);
        for (let i = 0; i < response.Ratings.length; i++) {
            const element = response.Ratings[i];
            console.log(element.Source + " Ratings: " + element.Value);
        }
        console.log('Country: ' + response.Country);
        console.log('Language: ' + response.Language);
        console.log('Plot: ' + response.Plot);
        console.log('Actors: ' + response.Actors);
    });
}

function getLines(filename, lineCount, callback) {
    let stream = fs.createReadStream(filename, {
        flags: "r",
        encoding: "utf-8",
        fd: null,
        mode: 438, // 0666 in Octal
        bufferSize: 64 * 1024
    });

    let data = "";
    let lines = [];
    stream.on("data", function (moreData) {
        data += moreData;
        lines = data.split("\n");
        // probably that last line is "corrupt" - halfway read - why > not >=
        if (lines.length > lineCount + 1) {
            stream.destroy();
            lines = lines.slice(0, lineCount); // junk as above
            callback(false, lines);
        }
    });

    stream.on("error", function () {
        callback("Error");
    });

    stream.on("end", function () {
        callback(false, lines);
    });

}

function whatSays() {
    getLines('./random.txt', 1, function (err, lines) {
        if (err) {
            console.log("Couldn't read the file. " + err);
            return;
        }
        var argument = lines[0].split(',');
        RunLiri(argument[0], argument[1].replace(new RegExp('"', 'g'), ''));
    });
}