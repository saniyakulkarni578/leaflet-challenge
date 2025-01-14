  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    //layers: [street, earthquakes]
});

// Create the base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

 let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
   attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

 let sat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
  maxZoom: 20,
  subdomains:['mt0','mt1','mt2','mt3']
});

// Create a baseMaps object.
let baseMaps = {
  "Street Map": street,
  "Topographic Map": topo,
  "Satellite Map": sat
};

// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let earthquakes = new L.LayerGroup();

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {

// Create a GeoJSON layer that contains the features array on the earthquakeData object.
// Run the onEachFeature function once for each piece of data in the array.
  L.geoJSON(data, {
    onEachFeature: onEachFeature,
    style: formatCircleMarker,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    }}).addTo(earthquakes);

//Store tectonic plate url as a query variable
let plateQueryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
let plates = new L.layerGroup();

// Perform a GET request to the plate query URL
d3.json(plateQueryUrl).then(function (plateData) {

  // Create a GeoJSON layer that contains the features array on the tectonicPlate object.
  // Run the onEachFeature function once for each piece of data in the array.
  L.geoJSON(plateData).addTo(plates);
});

// Create an overlay object to hold our overlays
let overlayMaps = {
  Earthquakes: earthquakes,
  TectonicPlates: plates
};

// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

earthquakes.addTo(myMap);
street.addTo(myMap);

// Define a function that we want to run once for each feature in the features array.
// Give each feature a popup that describes the place and time of the earthquake.
function onEachFeature(feature, layer) {
  layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
};

//Define function to select marker color based on depth
function chooseColor(depth) {
  var color = "";
  if (depth >= -10 && depth <= 10) {
      return color = "#98ee00";
  }
  else if (depth > 10 && depth <= 30) {
      return color = "#d4ee00";
  }
  else if (depth > 30 && depth <= 50) {
      return color = "#eecc00";
  }
  else if (depth > 50 && depth <= 70) {
      return color =  "#ee9c00";
  }
  else if (depth > 70 && depth <= 90) {
      return color = "#ea822c";
  }
  else if (90 < depth) {
      return color = "#ea2c2c";
  }
  else {
      return color = "black";
  }
}
//Define function to select marker size based on magnitude
function chooseSize(magnitude) {
  if (magnitude === 0) {
    return magnitude * 1
  };
  return magnitude * 5
};

// Create a function to format markers
function formatCircleMarker (feature, latlng) {
let format = {
    radius: chooseSize(feature.properties.mag),
    fillColor: chooseColor(feature.geometry.coordinates[2]),
    color: chooseColor(feature.geometry.coordinates[2]),
    opacity: 0.5
}
return format
}

});

//Set up map legend to show depth colors
let legend = L.control({ position: "bottomright"});

legend.onAdd = function () {
let div = L.DomUtil.create("div", "info legend");

let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"]
let depthRange = [-10, 10, 30, 50, 70, 90];

//loop through each range and create label with color
for (let i = 0; i < depthRange.length; i++) {
  div.innerHTML += 
  "<i style='background: " + colors[i] + " '></i>"  + 
  depthRange[i] + (depthRange[i + 1] ? "&ndash;" + depthRange[i + 1] + "<br>" : "+");
}
  return div;
};

//Add legend to map
legend.addTo(myMap);