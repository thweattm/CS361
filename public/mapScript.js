var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 44.5646, lng: -123.2620},
	  zoom: 8
	});
}