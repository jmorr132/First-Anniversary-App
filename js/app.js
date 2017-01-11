function ViewModel() {
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
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        marker.setAnimation(null);
                    }, 2000);
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