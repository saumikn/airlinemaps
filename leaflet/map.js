var map = L.map('map',).setView([37.8, -96], 5);
map.createPane("circles");
map.getPane("circles").style.zIndex = 999;

var tiles = L.tileLayer(
  'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var filterLayer = L.layerGroup();

function filterId(id) {
  map.removeLayer(lineLayer);
  map.removeLayer(halfLineLayer);
  map.removeLayer(clearLineLayer);
  filterLayer = L.geoJSON(routes, {
    style: feature => feature.properties.style,
    filter: (feature, layer) => feature.id.includes(id)
  }).addTo(map);

};

function showAll() {
  if (map.hasLayer(filterLayer)) {
    map.removeLayer(filterLayer);
    map.addLayer(lineLayer);
    map.addLayer(halfLineLayer);
    map.addLayer(clearLineLayer);
  }
}
map.on('click', () => showAll());

function onEachAirport(feature, layer) {
  layer.on('click', () => filterId(feature.id));
  layer.on('mouseover', () => filterId(feature.id));
  layer.on('mouseout', showAll);
}

function airportToCircle(feature, latlng) {
  return L.circleMarker(latlng, {
    radius: 4,
    color: 'white',
    fillOpacity: 1,
    pane: 'circles',
    bubblingMouseEvents: false
  });
}

function airportToMarker(feature, latlng) {
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


var airportLayer = L.geoJSON(airports, { onEachFeature: onEachAirport, pointToLayer: airportToCircle }).addTo(map);
var codeLayer = L.geoJSON(airports, { pointToLayer: airportToMarker }).addTo(map);
var lineLayer = L.geoJSON(routes, { style: styleLine }).addTo(map);
var clearLineLayer = L.geoJSON(routes, { style: styleClearLine, onEachFeature: onEachClearLine }).addTo(map);
let halfRoutes = JSON.parse(JSON.stringify(routes));
halfRoutes.features.forEach(x => x.geometry.coordinates = x.geometry.coordinates.slice(0, 3));
var halfLineLayer = L.geoJSON(halfRoutes, { style: styleLine }).addTo(map);