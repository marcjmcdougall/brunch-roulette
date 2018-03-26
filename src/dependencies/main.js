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
		locations: []
	},
	created: function(){

		console.log('Ready.');

	},
	methods: {

		prepLocations: prepLocations
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

	// Documentation Here: https://developers.google.com/places/web-service/search?authuser=1
	var apiKey = 'AIzaSyD5KokvEpZuhbLRTUwUNoLU27LdTVeo8Ho';
	var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=33.762480,-84.359116&radius=10000&opennow=true&types=restaurant&keyword=brunch&key=' + apiKey;

	console.log('Sending request to: ' + url);

	this.$http.get(url).then(function(response){

		// Success!
		var results = filterResults(response.body.results);

		console.log('\nSEARCH RESULTS');
		console.log('==============');

		results.forEach(function(el){

			console.log(el.name + ': ' + el.rating);
		});

		console.log('\n==============\nRaw (filtered) data:');
		console.log(results);

		this.locations = results;

	}, function(response){

		// There was some error, so log it.
		console.log(response);
	});
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
