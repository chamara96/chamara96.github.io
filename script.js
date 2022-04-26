// const api_url = "http://localhost:9090/api/network";
const api_url = "/network.json";

const color_list = ['#2471A3', '#E74C3C', '#7D3C98'];

async function getapi(url) {
    // Storing response
    const response = await fetch(url);
    // Storing data in form of JSON
    var data = await response.json();
    console.log(data);
    if (response) {
        return data;
    } else {
        return false;
    }
    // show(data);
}

// Initialize and add the map
async function initMap() {
    // Calling that async function
    data = await getapi(api_url);

    const uluru = { lat: -33.890542, lng: 151.274856 };
    // The map, centered at Uluru
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: new google.maps.LatLng(52.029278, -1.679712),
    });
    // The marker, positioned at Uluru
    // const marker = new google.maps.Marker({
    //     position: uluru,
    //     map: map,
    // });
    var infowindow = new google.maps.InfoWindow();

    // var infoWindow2 = new google.maps.InfoWindow();

    infowindow.open(map);

    map.addListener("click", (mapsMouseEvent) => {
        // Close the current InfoWindow.
        infowindow.close();
        // Create a new InfoWindow.
        infowindow = new google.maps.InfoWindow({
            position: mapsMouseEvent.latLng,
        });
        infowindow.setContent(
            JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
        );
        infowindow.open(map);
    });

    var marker_towers, marker_networks, marker_regions, i, j, k;

    for (k = 0; k < data['networks'].length; k++) {
        var net_color = color_list[k];
        var network_geo = new google.maps.LatLng(data['networks'][k]['location']['latitude'], data['networks'][k]['location']['longitude'])
        marker_networks = new google.maps.Marker({
            position: network_geo,
            map: map
        });

        google.maps.event.addListener(marker_networks, 'click', (function (marker_networks, k) {
            return function () {
                infowindow.setContent('Network:' + data['networks'][k]['name']);
                infowindow.open(map, marker_networks);
            }
        })(marker_networks, k));

        paht_regions = [];

        for (i = 0; i < data['networks'][k]['regions'].length; i++) {
            var region_geo = new google.maps.LatLng(data['networks'][k]['regions'][i]['location']['latitude'], data['networks'][k]['regions'][i]['location']['longitude'])
            marker_regions = new google.maps.Marker({
                position: region_geo,
                icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                map: map
            });

            google.maps.event.addListener(marker_regions, 'click', (function (marker_regions, i, k) {
                return function () {
                    infowindow.setContent('Region:' + data['networks'][k]['regions'][i]['name']);
                    infowindow.open(map, marker_regions);
                }
            })(marker_regions, i, k));

            paht_regions.push(network_geo, region_geo);

            var path = [];

            for (j = 0; j < data['networks'][k]['regions'][i]['towers'].length; j++) {
                var tower_geo = new google.maps.LatLng(data['networks'][k]['regions'][i]['towers'][j]['location']['latitude'], data['networks'][k]['regions'][i]['towers'][j]['location']['longitude'])
                marker_towers = new google.maps.Marker({
                    position: tower_geo,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    map: map
                });

                path.push(region_geo, tower_geo);

                const cityCircle = new google.maps.Circle({
                    strokeColor: net_color,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: net_color,
                    fillOpacity: 0.35,
                    map,
                    center: new google.maps.LatLng(data['networks'][k]['regions'][i]['towers'][j]['location']['latitude'], data['networks'][k]['regions'][i]['towers'][j]['location']['longitude']),
                    radius: data['networks'][k]['regions'][i]['towers'][j]['radius'] * 1000,
                });

                google.maps.event.addListener(cityCircle, 'click', function (ev) {
                    infowindow.setPosition(ev.latLng);
                    infowindow.setContent(
                        JSON.stringify(ev.latLng.toJSON(), null, 2)
                    );
                    infowindow.open(map);
                });

                google.maps.event.addListener(marker_towers, 'click', (function (marker_towers, i, j, k) {
                    return function () {
                        infowindow.setContent('Tower:' + data['networks'][k]['regions'][i]['towers'][j]['name']);
                        infowindow.open(map, marker_towers);
                    }
                })(marker_towers, i, j, k));
            }

            var line = new google.maps.Polyline({
                path: path,
                strokeColor: net_color,
                strokeOpacity: 1.0,
                strokeWeight: 2,
                geodesic: true,
                map: map
            });


        }

        var line = new google.maps.Polyline({
            path: paht_regions,
            strokeColor: net_color,
            strokeOpacity: 1.0,
            strokeWeight: 4,
            geodesic: true,
            map: map
        });
    }




    // for (i = 0; i < locations.length; i++) {
    //     marker = new google.maps.Marker({
    //         position: new google.maps.LatLng(locations[i][1], locations[i][2]),
    //         map: map
    //     });

    //     google.maps.event.addListener(marker, 'click', (function (marker, i) {
    //         return function () {
    //             infowindow.setContent(locations[i][0]);
    //             infowindow.open(map, marker);
    //         }
    //     })(marker, i));
    // }
}


window.initMap = initMap;
