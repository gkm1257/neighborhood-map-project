let map;
let markers = []; // The array saves all markers
let bounds; // The bound of all locations
let center; // The center of all locations
let infoWindow; // The window showing more info
let infoList = []; // The array saves info fetched from Zomato
let allInfoLoaded = false; // True if all information loaded successfully

let locations = [
	{title: "Hatsuhana", location: {lat: 40.757129, lng: -73.976963}, zomatoId: 16767680},
	{title: "Pure Thai Cookhouse", location: {lat: 40.764230, lng: -73.988196}, zomatoId: 16785728},
	{title: "Burger Joint", location: {lat: 40.764185, lng: -73.978405}, zomatoId: 16761402},
	{title: "Momofuku Noodle Bar", location: {lat: 40.729438, lng: -73.984548}, zomatoId: 16781904},
	{title: "Lombardi's Pizza", location: {lat: 40.739946, lng: -73.998261}, zomatoId: 16771079},
	{title: "Joe's Shanghai", location: {lat: 40.714747, lng: -73.997672}, zomatoId: 16769041},
	{title: "Katz's Delicatessen", location: {lat: 40.722253, lng: -73.987342}, zomatoId: 16769546},
	{title: "Gramercy Tavern", location: {lat: 40.738716, lng: -73.988389}, zomatoId: 16767139},
	{title: "Szechuan Gourmet", location: {lat: 40.752307, lng: -73.983522}, zomatoId: 16779008},
	{title: "Peter Luger Steak House", location: {lat: 40.709877, lng: -73.962341}, zomatoId: 16775039}
];

let Place = function(data, index) {
	this.title = data.title;
	this.id = index;
}

let ViewModel = function() {
	let self = this;  // Make sure we can always access the scope of ViewModel everytime

	// Show and hide slide menu
	this.clickMenu = () => {
		$(".list-box").toggleClass("menu-hidden");
		$(".header").toggleClass("expand");
		$(".map").toggleClass("expand");
		setTimeout(updateMap, 50);
	};

	// Add titles of restaurants to an observable array
	this.list = ko.observable([]);
	for (let i = 0; i < locations.length; i++) {
		self.list().push(new Place(locations[i], i));
	}

	// Show infoWindow when clicked on the list
	this.selectItem = clickedItem => {
		showInfo(markers[clickedItem.id], infoWindow);
	};

	// Get text-input from the input box
	this.searchText = ko.observable("");

	// Filter search results in the list
	this.filteredList = ko.computed(() => {
		if (self.searchText().length > 0) {
			return self.list().filter(place => place.title.toLowerCase().indexOf(self.searchText().toLowerCase()) > -1);
		} else {
			return self.list();
		}
	});

	// Filter markers
	this.filterMarker = () => {
		markers.forEach(marker => marker.setVisible(false));
		self.filteredList().forEach(place => {
			markers[place.id].setVisible(true);
		});
	};
}

function initMap() {
	map = new google.maps.Map(document.getElementsByClassName("map")[0], {
		center: {lat: 24.179018, lng: 120.600357},
		zoom: 13
	});

	// Create an array of markers by locations array and show the markers on the map
	bounds = new google.maps.LatLngBounds();
	infoWindow = new google.maps.InfoWindow();
	for (let i = 0; i < locations.length; i++) {
		let position = locations[i].location;
		let title = locations[i].title;
		let marker = new google.maps.Marker({
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: i
		});
		markers.push(marker);
		markers[i].setMap(map);
		bounds.extend(markers[i].position);
		markers[i].addListener('click', () => {
			showInfo(markers[i], infoWindow);
		});
	}
	map.fitBounds(bounds);
	center = map.getCenter();
}

// Update the map when map size changed
function updateMap() {
	google.maps.event.trigger(map, "resize");
	map.setCenter(center);
	map.fitBounds(bounds);
}

// Populate infoWindow and show more info
function showInfo(marker, infoWindow) {
	if (infoWindow.marker != marker) {
		infoWindow.marker = marker;
		if (allInfoLoaded) {
			infoWindow.setContent(
				`<div>
					<h3>${marker.title}</h3>
					<p><b>Cuisines: ${infoList[infoWindow.marker.id].cuisine}</b></p>
					<a href=${infoList[infoWindow.marker.id].zUrl} target="_blank">More info on Zomato</a>
				</div>`
			);
		} else {
			infoWindow.setContent(
				`<div>
					<h3>${marker.title}</h3>
				</div>`
			);
		}
		infoWindow.open(map, marker);
		infoWindow.addListener('closeclick', () => {
			infoWindow.marker = null;
		});
		// Add animation to marker when selected
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(() => {
			marker.setAnimation(null);
		}, 1400);
	}
}


// Zomato API
function initZomato() {
	const apiKey = "4e6d41b81688666b66f6cac2084776a0";
	let url = "https://developers.zomato.com/api/v2.1/restaurant?res_id=";

	// Fetch all restaurants' detail
	let promises = [];
	locations.forEach((place, index) => {
		let searchUrl = url + place.zomatoId;
		promises.push(
			fetch(searchUrl, {
				headers: {
			        "X-Zomato-API-Key": apiKey
				}
		    })
			.then(response => response.json())
			.catch(error => requestError(error))
			.then(response => getResult(response, index))
			.catch(error => requestError(error))
		);
	});
	Promise.all(promises).then(() => {
		allInfoLoaded = true;
	});
}
// Save interested info into infoList
function getResult(result, index) {

	infoList.splice(index, 0, {cuisine: result.cuisines, zUrl: result.url});
}
// Error handling
function requestError(error) {

	throw Error('Search Request Error');
	alert("Error occurred when fetching data from Zomato");
}

// Update the map when window resized
$(window).resize(updateMap);

ko.applyBindings(new ViewModel());
initZomato();
