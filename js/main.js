let map;
let markers = [];
let bounds; // The bound of all locations
let center; // The center of all locations

let locations = [
	{title: "Pier 81", location: {lat: 40.761949, lng: -74.002552}},	
	{title: "Reynard", location: {lat: 40.722482, lng: -73.956636}},	
	{title: "Pera Soho", location: {lat: 40.723918, lng: -74.003515}},	
	{title: "Momofuku Noodle Bar", location: {lat: 40.729438, lng: -73.984548}},	
	{title: "Pardon My French", location: {lat: 40.724751, lng: -73.981142}},	
	{title: "Zum Schneider NYC", location: {lat: 40.724306, lng: -73.978906}},	
	{title: "Katz's Delicatessen", location: {lat: 40.722253, lng: -73.987342}},	
	{title: "Tijuana Picnic", location: {lat: 40.720931, lng: -73.987175}},	
	{title: "Nippon", location: {lat: 40.757527, lng: -73.970301}},	
	{title: "Mr Chow", location: {lat: 40.758613, lng: -73.964499}}	
];

let ViewModel = function() {
	let self = this;  // Make sure we can always access the scope of ViewModel everytime

	this.clickMenu = () => {
		$(".list-box").toggleClass("menu-hidden");
		$(".header").toggleClass("expand");
		$(".map").toggleClass("expand");
		setTimeout(updateMap, 50);
	};

	// this.markers = [];

}

function initMap() {
	map = new google.maps.Map(document.getElementsByClassName("map")[0], {
		center: {lat: 24.179018, lng: 120.600357},
		zoom: 13
	});

	// Create an array of markers by locations array and show the markers on the map
	bounds = new google.maps.LatLngBounds();
	let infoWindow = new google.maps.InfoWindow();
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

function showInfo(marker, infoWindow) {
	if (infoWindow.marker != marker) {
		infoWindow.marker = marker;
		infoWindow.setContent('<div><b>' + marker.title + '</b></div>');
		infoWindow.open(map, marker);
		infoWindow.addListener('closeclick', () => {
			infoWindow.marker = null;
		})
	}
}

$(window).resize(updateMap);

ko.applyBindings(new ViewModel());