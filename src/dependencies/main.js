// ==========
// Variables
// ==========

// Used to enable or disable certain development-only functionality.  Change this to false in a production environment.
var ENV_DEV = true;


// ==========
// Initialization
// ==========

var app = new Vue({
  
	el: '#app',
	data: {

		status: 'ready',
		position: null,
		locations: [],
		waiting: false,
		spinning: false,
		locationIndex: 0
	},
	computed: {

		rouletteViewOffset: function(){

			var leftPercent = this.locationIndex * -100;
			var leftOffset = this.locationIndex * 100;
			var leftValue = 'calc(' + leftPercent + '% - ' + (this.locationIndex * 100) + 'px)';

			return { left : leftValue };
		}
	},
	created: function(){

		console.log('Ready.');

		// Configure Geolocator.
		// Documentation Here: https://github.com/onury/geolocator
		geolocator.config({

	        language: "en",
	        google: {

	            key: "AIzaSyDiTvLXRIuCHTlTQimnBzgv1gQ0yCdd2B4"
	        }
	    });

	    prepLocations();
	},
	methods: {

		prepLocations: prepLocations,
		tryDoSpin: function(){

			// Check if the locations have been found yet.
			if(this.locations.length > 0){

				waiting = false;

				// If they have, spin away!
				this.doSpin();
			}
			else{

				this.waiting = true;

				// Otherwise, try again in 500 milliseconds.
				setTimeout(this.tryDoSpin, 500);
			}
		},
		doSpin: function(){

			if(this.locationIndex  === 0){

				this.locationIndex = this.locations.length - 1;
			}	
			else{

				var possibleIndex = Math.floor(Math.random() * (this.locations.length - 1));

				// Prevent the first item from being selected (the homepage).
				if(possibleIndex === 0){

					possibleIndex = 1;
				}

				this.locationIndex = possibleIndex;
			}

			this.spinning = true;

			prepReviewsForLocation(this.locations, this.locationIndex);

			setTimeout(function(){

				app.spinning = false;

			}, 5500);
		},
		getLeftOffsetValue : function(index){

			// Increase the index to push the content to the right of the homepage.
			index++;

			var leftPercent = index * 100;
			var leftOffset = index * 100;
			var leftValue = 'calc(' + leftPercent + '% + ' + (index * 100) + 'px)';

			return { left: leftValue };
		},
		// TODO: Fix this.
		getSingleBackgroundImage: function(){

			// var randomIndex = Math.floor(Math.random() * (this.imageOptions.length - 1));

			// // console.log('linear-gradient(bottom right, rgba(106, 96, 169, 0.8), rgba(206, 159, 252, 0.8)), url("' + this.imageOptions[randomIndex] + '")');
			// var output = 'linear-gradient(bottom right, rgba(106, 96, 169, 0.8), rgba(206, 159, 252, 0.8)), url(\'' + this.imageOptions[randomIndex] + '\');';

			// return { background: output };
		}
	}

});



// ==========
// Event Bindings
// ==========

// Coming soon.


// ==========
// Helper Functions
// ==========

// Prepares a list of the nearby brunch locations.
function prepLocations(){

	console.log('Prepping locations now...');

	// Configure the geolocator.
	var options = {

        enableHighAccuracy: true,
        timeout: 5000,
        maximumWait: 10000,     // max wait time for desired accuracy
        maximumAge: 10000,          // disable cache
        addressLookup: true,    // requires Google API key if true
        desiredAccuracy: 30,    // meters
        fallbackToIP: true,     // fallback to IP if Geolocation fails or rejected
    };

    // Locate the user via any method necessary (GPS or IP data).
    geolocator.locate(options, function (err, location) {

    	// Simple error logging.
        if (err) return console.log(err);

        console.log('Location found! Polling Google for nearby brunch spots now...');
		console.log(location);

		onLocationFound(location);
    });
}

// Handler for what happens when the user's location is found.
function onLocationFound(location){

	// Update the model with the coordinate pair for use later.
	app.position = location;

	// If successful, find all nearby brunch locations at those coordinates.
    findNearbyBrunchLocations(location.coords);

}

// Finds all 4-star and up open brunch locations within 5 miles of a given coordinate pair.
function findNearbyBrunchLocations(position){

	// Create the necessary objects for Google places to consume the request properly.
	var myLocation = new google.maps.LatLng(position.latitude, position.longitude);
	var service = new google.maps.places.PlacesService(document.getElementById('gmap-attribution'));
	var request = {

		location: myLocation,
		radius: '8000', // Within ~5 miles.
		type: 'restaurant', // Restaurants only.
		keyword: 'brunch', // Must be tagged for brunch!
		openNow: true // Must be open now.
	}

	console.log('Sending request to Google now...');

	// Perform the nearby search.
	service.nearbySearch(request, function(results, status, pagination){

		if(status == google.maps.places.PlacesServiceStatus.OK){

			// Success!
			var filteredResults = filterResults(results);

			console.log('\nSEARCH RESULTS');
			console.log('==============');

			filteredResults.forEach(function(el){

				console.log(el.name + ': ' + el.rating);
			});

			console.log('\n==============\nRaw (filtered) data:');
			console.log(filteredResults);

			app.locations = filteredResults;
		}
		else{

			// Failure!
			console.log('There was an error with the request ' + status);
		}
	});
}

// Preps the reviews for a particular location.
function prepReviewsForLocation(locations, locationIndex){

	var currentLocation = locations[locationIndex];

	if(!currentLocation.reviews){

		var service = new google.maps.places.PlacesService(document.getElementById('gmap-attribution'));
		service.getDetails({placeId: currentLocation.place_id}, function(response){

			app.locations[locationIndex - 1].reviews = response.reviews;
			console.log(app.locations[locationIndex - 1].reviews);
		});
	}
}

// Filters the results to remove any results that has a rating less than 4.0.
function filterResults(results){

	var output = [];

	results.forEach(function(el){

		if(el.rating >= 4.0){

			output.push(el);
		}
	});

	return output;
}

// Accepts an array, and shuffles them about.
function shuffleResults(results) {

    var j, x, i;

    for (i = results.length - 1; i > 0; i--) {

        j = Math.floor(Math.random() * (i + 1));
        x = results[i];
        results[i] = results[j];
        results[j] = x;
    }
}

