var ViewModel = function() {
    var self = this;
    /**the array of visible markers is the one the will be displayed on the mapl and in the list of resturants**/
    self.markersVisible = ko.observableArray([]);
    /**the array of markers will save all the locations - the ones that are displayed and the ones that are not displyed**/
    self.markersMap = ko.observableArray([]);
    self.infoWindows = ko.observableArray([]);

    function initialize() {
        /**creation of the map**/
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: {lat: 48.428702, lng: -123.365071}
        });
        var infowindow = new google.maps.InfoWindow({});
        /*client id and client secret for foursquare api*/
        var CLIENT_ID_Foursquare = "WUD2RNWVNITJBYFSMVMAJA2CIDEZA2RLWHCL23COSXWX4D1G";
        var CLIENT_SECRET_Foursquare = "V1FOIQFUDTZS5YP1VWX4BBNNQAKCLJMSE3NXINYGGGXOCHDD";
        /**creating all the markers on the map**/
        initialData.forEach(function(item) {
            /*Foursquare api ajax request*/
            $.ajax({
                type: "GET",
                dataType: 'json',
                cache: false,
                url: 'https://api.foursquare.com/v2/venues/explore',
                data: 'limit=1&ll=' + item.lat + ',' + item.lng + '&query=' + item.title + '&client_id=' + CLIENT_ID_Foursquare + '&client_secret=' + CLIENT_SECRET_Foursquare + '&v=20140806&m=foursquare',
                async: true,
                success: function(data) {
                    /*callback function if succes - Will add the rating received from foursquare to the content of the info window*/
                    item.rating = data.response.groups[0].items[0].venue.rating;
                    console.log(data.response.photo);
                    if (!item.rating) {
                        item.rating = 'No rating in foursquare';
                    }
                    marker.content = '<br><div class="labels">' + '<div class="title">' + item.title + '</div><div class="rating">Foursquare rating: ' + item.rating + '</div><p>' + item.description + '</p>' + '<a href=' + item.URL + '>' + item.URL + '</a>' + '</div>';
                },
                error: function(data) {
                    /*callback function if error - an alert will be activaded to notify the user of the error*/
                    alert("Could not load data from foursquare!");
                }
            });
            
            /*creation of new markers*/
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(item.lat, item.lng),
                map: map,
                title: item.title,
                description: item.description,
                URL: item.URL,
                rating: item.rating,
                /**if the location on the list is clicked than the info window of the marker will appear-**/
                listClick: function(thisMarker) {
                    infowindow.setContent(marker.content);
                    infowindow.open(map, thisMarker);
                }
            });
            self.markersVisible.push(marker);
            self.markersMap.push(marker);
            marker.addListener('click', function() {
                /*if the animation is allready active, clicking again will stop it*/
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
        /**mark all markers as invisible and remove them from the visible markers list**/
        self.markersMap().forEach(function(item) {
            item.setVisible(false);
            self.markersVisible.remove(item);
        });
        self.markersMap().forEach(function(item) {
            if (item.title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                /**if the place is relevant to the search, make the marker visible and add the marker to the visible markers list**/
                item.setVisible(true);
                self.markersVisible.push(item);
            }
        });
    });

    google.maps.event.addDomListener(window, 'load', initialize);
};