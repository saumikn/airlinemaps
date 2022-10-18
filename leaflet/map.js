var map = L.map('map',).setView([37.8, -96], 5);
map.createPane("airports");
map.getPane("airports").style.zIndex = 998;

map.createPane("circles");
map.getPane("circles").style.zIndex = 999;

var tiles = L.tileLayer(
  'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var filterRouteLayer = L.layerGroup();
var filterAirportLayer = L.layerGroup();
var filterLabelLayer = L.layerGroup();

function getConnections(id) {
  var connections = new Set();
  connections.add(id)
  routes.features.forEach(x => {
    label = x.id.split('_');
    if (label[0] == id) {
      connections.add(label[1])
    }
    if (label[1] == id) {
      connections.add(label[0])
    }
  })
  return connections;
}

function filterId(id) {
  if (!map.hasLayer(filterRouteLayer)) {
    var connections = getConnections(id);
    map.removeLayer(lineLayer);
    map.removeLayer(halfLineLayer);
    map.removeLayer(clearLineLayer);
    map.removeLayer(airportLayer);
    map.removeLayer(labelLayer);
    filterAirportLayer = L.geoJSON(airports, {
      onEachFeature: onEachAirport,
      pointToLayer: airportToCircleMarker,
      filter: (feature, layer) => connections.has(feature.id)
    }).addTo(map);
    filterLabelLayer = L.geoJSON(airports, {
      onEachFeature: onEachAirport,
      pointToLayer: airportToLabel,
      filter: (feature, layer) => connections.has(feature.id)
    }).addTo(map);
    filterRouteLayer = L.geoJSON(routes, {
      style: feature => feature.properties.style,
      filter: (feature, layer) => feature.id.includes(id)
    }).addTo(map);
  }
};

function showAll() {
  if (map.hasLayer(filterLabelLayer)) {
    map.removeLayer(filterAirportLayer);
    map.removeLayer(filterLabelLayer);
    map.removeLayer(filterRouteLayer);
    map.addLayer(lineLayer);
    map.addLayer(halfLineLayer);
    map.addLayer(clearLineLayer);
    map.addLayer(airportLayer);
    map.addLayer(labelLayer)
  }
}
map.on('click', () => showAll());

function onEachAirport(feature, layer) {
  layer.on('click', () => filterId(feature.id));
  layer.on('mouseover', () => filterId(feature.id));
  layer.on('mouseout', showAll);
}

function airportToCircleMarker(feature, latlng) {
  return L.circleMarker(latlng, {
    radius: 4,
    color: 'white',
    fillOpacity: 1,
    pane: 'airports',
    bubblingMouseEvents: false
  });
}

function airportToCircle(feature, latlng) {
  return L.circle(latlng, {
    radius: 10000,
    color: 'green',
    opacity: 0,
    fillOpacity: 0,
    pane: 'circles',
    bubblingMouseEvents: false
  });
}

function airportToLabel(feature, latlng) {
  return L.marker(latlng, {
    icon: L.divIcon({ className: 'codes', iconAnchor: [0, 22], iconSize: [0, 0], html: feature.id }),
  });
}

function styleLine(feature) {
  return { color: feature.properties.style.color, weight: 1 };
}

function styleClearLine(feature) {
  return { weight: 10, opacity: 0, fill: false };
}

function onEachClearLine(feature, layer) {
  layer.bindTooltip(feature.id);
  layer.on('mouseover', (ev) => layer.openTooltip(ev.latlng));
}


var airportLayer = L.geoJSON(airports, { pointToLayer: airportToCircleMarker }).addTo(map);
var clearAirportLayer = L.geoJSON(airports, { onEachFeature: onEachAirport, pointToLayer: airportToCircle }).addTo(map);
var labelLayer = L.geoJSON(airports, { pointToLayer: airportToLabel }).addTo(map);
var lineLayer = L.geoJSON(routes, { style: styleLine }).addTo(map);
var clearLineLayer = L.geoJSON(routes, { style: styleClearLine, onEachFeature: onEachClearLine }).addTo(map);
let halfRoutes = JSON.parse(JSON.stringify(routes));
halfRoutes.features.forEach(x => x.geometry.coordinates = x.geometry.coordinates.slice(0, 3));
var halfLineLayer = L.geoJSON(halfRoutes, { style: styleLine }).addTo(map);