var ViewModel = function() {
    var self = this;
    self.markersVisible = ko.observableArray([]);
    self.markersMap = ko.observableArray([]);
    self.infoWindows = ko.observableArray([]);

    function initialize() {
        // Renders Google Map with starting lat/lng
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: {lat: 48.428702, lng: -123.365071}
        });
        var infowindow = new google.maps.InfoWindow({});
        // Client Information for the Foursquare API
        var CLIENT_ID_Foursquare = "WUD2RNWVNITJBYFSMVMAJA2CIDEZA2RLWHCL23COSXWX4D1G";
        var CLIENT_SECRET_Foursquare = "V1FOIQFUDTZS5YP1VWX4BBNNQAKCLJMSE3NXINYGGGXOCHDD";
        // This Function will create map markers.
        initialData.forEach(function(item) {
            // Ajax Request for foursquare
            $.ajax({
                type: "GET",
                dataType: 'json',
                cache: false,
                url: 'https://api.foursquare.com/v2/venues/explore',
                data: 'limit=1&ll=' + item.lat + ',' + item.lng + '&query=' + item.title + '&client_id=' + CLIENT_ID_Foursquare + '&client_secret=' + CLIENT_SECRET_Foursquare + '&v=20140806&m=foursquare',
                async: true,
                success: function(data) {
                    // Displays Foursquare information in information window.
                    item.rating = data.response.groups[0].items[0].venue.rating;
                    console.log(data.response.photo);
                    if (!item.rating) {
                        item.rating = 'No rating in foursquare';
                    }
                    marker.content = '<br><div class="labels">' + '<div class="title">' + item.title + '</div><div class="rating">Foursquare rating: ' + item.rating + '</div><p>' + item.description + '</p>' + '<a href=' + item.URL + '>' + item.URL + '</a>' + '</div>';
                },
                error: function(data) {
                    // Notifies users of Foursquare error
                    alert("Could not load data from foursquare!");
                }
            });
            
           //Creates new Map Markers
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(item.lat, item.lng),
                map: map,
                title: item.title,
                description: item.description,
                URL: item.URL,
                rating: item.rating,
                listClick: function(thisMarker) {
                    infowindow.setContent(marker.content);
                    infowindow.open(map, thisMarker);
                }
            });
            self.markersVisible.push(marker);
            self.markersMap.push(marker);
            marker.addListener('click', function() {
                if (marker.getAnimation() == null) {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        marker.setAnimation(null);
                    }, 2000);
                } else {
                    marker.setAnimation(null);
                }
                infowindow.setContent(marker.content);
                infowindow.open(map, marker);
            });
        });
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        markers = [];
          // Bias the SearchBox results towards current map's viewport.
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
              var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
              };

              // Create a marker for each place.
              markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
              }));

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
    self.query = ko.observable('');
    self.query.subscribe(function(value) {
        //Toggles markers off
        self.markersMap().forEach(function(item) {
            item.setVisible(false);
            self.markersVisible.remove(item);
        });
        self.markersMap().forEach(function(item) {
            if (item.title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                item.setVisible(true);
                self.markersVisible.push(item);
            }
        });
    });

    google.maps.event.addDomListener(window, 'load', initialize);
};