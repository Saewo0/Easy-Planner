// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
var map, prev_infowindow =false;

function initAutocomplete() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.8075, lng: -73.9626},
    zoom: 13,
    mapTypeId: 'roadmap'
  });
  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('You\'re Here');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  // Create the search box and link it to the UI element.
  var query = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(query);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(query);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      // Create a marker for each place.
      createMarker(markers, place);

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function createMarker(markers, place) {
  var infowindow = new google.maps.InfoWindow();
  var icon = {
    url: place.icon,
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25)
  };

  var marker = new google.maps.Marker({
    map: map,
    icon: icon,
    title: place.name,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    if ( prev_infowindow ) {
      prev_infowindow.close();
    }
    prev_infowindow = infowindow;
    var contentString = '<div id="content">' +
                          '<h3 id="firstHeading" class="placeName">' + place.name + '</h3>' +
                          '<div id="bodyContent">' +
                            '<p>Rating:' + place.rating + '</p>' +
                            '<p><a href="'+ place.website + '">Official Website</a></p>' +
                            '<p>PlaceID:' + place.place_id + '</p>' +
                          '</div>' +
                        '</div>';
    infowindow.setContent(contentString);
    infowindow.open(map, this);
  });

  google.maps.event.addListener(marker, 'dblclick', function() {
    document.getElementById('eventDest').value = place.name;
    document.getElementById('eventDestID').value = place.place_id;
  });

  markers.push(marker);
}

$('.event-create').click(function() {createEvent();});

function createEvent() {
  
  var eventName = $('#eventName').val();
  var eventDest = $('#eventDest').val();
  var start = $('#startdatetime').val();
  var end = $('#enddatetime').val();
  eventName = $('#eventName').val();

  console.log(eventName);
  if ($.trim(eventName) == '' || $.trim(eventDest) == '') {
    return false;
  }

  var params = {
    // This is where any modeled request parameters should be added.
    // The key is the parameter name, as it is defined in the API in API Gateway.
    param0: 'Accept:application/json',
    "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Origin" : '*',
    "Access-Control-Allow-Methods" : "POST"
  };
  var additionalParams = {
    // If there are any unmodeled query parameters or headers that must be
    //   sent with the request, add them here.
    headers: {}
  };
  var Event = {
    name : eventName,
    destination : eventDest,
    start: start,
    end: end,
    timestamp : Date.parse(new Date())
  };
  var Events = [{
    type : "string",
    event : Event
  }];
  var body = {
    events : Events
  };
  //setTimeout(function() {
  //  fakeMessage();
  //}, 1000 + (Math.random() * 20) * 100);
  apigClient.chatbotPost(params, body, additionalParams)
    .then(function(result){
      console.log(result);
      var mes = result.data.messages[0].unstructured.text;
      console.log(mes);
      fakeMessage(mes);
    }).catch( function(result){
      // Add error callback code here.
      fakeMessage("Sorry, please try again");
    });
}