let map;
let markers = [];


let ViewModel = function() {
	let self = this;  // Make sure we can always access the scope of ViewModel everytime

	
}

function initMap() {
	map = new google.maps.Map(document.getElementsByClassName("map")[0], {
		center: {lat: 24.179018, lng: 120.600357},
		zoom: 13
	});
}