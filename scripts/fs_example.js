var map;

var config = {
    apiKey: 'ZNRM2YYMRQDC4T5JJVTJUPIDKED5YSJX3FWDNBFSRXMBWXT2',
    authUrl: 'http://edeleastar.github.io/fsexample/',
    apiUrl: 'http://edeleastar.github.io/fsexample/'
};

var fsConfig = {
    base_url: 'https://api.foursquare.com/v2/venues/explore?',
    client_id: '5FP3ANJK1LWS14NJFEZSWPYKYRS13FX2P4QNTQU0ULJMPJGN',
    client_secret: 'JAS2PGH2BY0SY0CJZJNXW1QEGQLN5JMNUTGJ1XPTTZLQYFA5'
}

// function doAuthRedirect() {
//   var redirect = window.location.href.replace(window.location.hash, '');
//   var url = config.authUrl + 'oauth2/authenticate?response_type=token&client_id=' + config.apiKey +
//       '&redirect_uri=' + encodeURIComponent(redirect) +
//       '&state=' + encodeURIComponent($.bbq.getState('req') || 'users/self');
//   window.location.href = url;
// }
// ;
// if ($.bbq.getState('access_token')) {
//   // If there is a token in the state, consume it
//   var token = $.bbq.getState('access_token');
//   $.bbq.pushState({}, 2)
// } else if ($.bbq.getState('error')) {
// } else {
//   doAuthRedirect();
// }

$("#search_btn").click(function() {
    if (map) {
        map.remove()
    }
    $('#venue_table tbody').remove();
    var vanue_keyword = $("#vanue_keyword").val()
    var location_name = $("#location_name").val();
    load_venues(location_name, vanue_keyword)
});
/* HTML 5 geolocation. */

function load_venues(location_name, vanue_keyword, user_current_location) {
    if (typeof user_current_location == 'undefined') {
        user_current_location = false;
    }

    var base_url = user_current_location ? fsConfig.base_url + "ll=" + lat + ',' + lng + '&client_id=' + fsConfig.client_id + '&client_secret=' + fsConfig.client_secret + '&v=20140601' : fsConfig.base_url + "near=" + location_name + '&query='+ vanue_keyword +'&client_id=' + fsConfig.client_id + '&client_secret=' + fsConfig.client_secret + '&v=20140601';
    if (user_current_location === true) {
        load_venues_use_current_location(base_url);
    } else {
        retrieve_venue(base_url)
    }

}


function load_venues_use_current_location(base_url) {
    navigator.geolocation.getCurrentPosition(function(data) {

        var lat = data['coords']['latitude'];
        var lng = data['coords']['longitude'];
        retrieve_venue(base_url, lat, lng)
    })

}

function retrieve_venue(base_url, lat, lng) {
    $.getJSON(base_url, {}, function(data) {
        venues = data.response.groups[0].items;
        /* Place marker for each venue. */
        for (var i = 0; i < venues.length; i++) {
            var venue = venues[i];
            $('#venue_table').append('<tr><td>' + venue.venue.name + '</td><td>'+ venue.venue.stats.checkinsCount +'</td><td>'+ venue.venue.stats.usersCount +'</td></tr>');
        }

        var geo_info = data.response.geocode.center;
        map = L.map('map_canvas').setView([geo_info.lat, geo_info.lng], 13);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
            maxZoom: 18,
            id: 'mapbox.streets'
        }).addTo(map);

        for (var i = 0; i < venues.length; i++) {
            /* Get marker's location */
            var latLng = new L.LatLng(
                venues[i].venue.location.lat,
                venues[i].venue.location.lng
            );
            /* Build icon for each icon */
            var fsqIcon = venues[i]['venue']['categories'][0]['icon'];
            var fs_icon_type = fsqIcon.prefix.split("categories_v2")[1]
            var leafletIcon = L.Icon.extend({
                options: {
                    iconUrl: "https://foursquare.com/img/categories" + fs_icon_type + '32' + fsqIcon['suffix'],
                    shadowUrl: null,
                    iconSize: new L.Point(32, 32),
                    iconAnchor: new L.Point(16, 41),
                    popupAnchor: new L.Point(0, -51)
                }
            });
            var icon = new leafletIcon();
            var marker = new L.Marker(latLng, {
                icon: icon
            })
                .bindPopup(venues[i]['venue']['name'], {
                    closeButton: false
                })
                .on('mouseover', function(e) {
                    this.openPopup();
                })
                .on('mouseout', function(e) {
                    this.closePopup();
                });
            map.addLayer(marker);
        }
    });

}
