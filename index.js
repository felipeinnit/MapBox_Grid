 // Create the Mapbox
 mapboxgl.accessToken = 'pk.eyJ1IjoiZmFuc2hhciIsImEiOiJja3NvZTE4aHQwaGl1MnBucHdjYTN0ZGFqIn0.yAx21vHCGv6TNEcfaEYcpQ';

 let map = new mapboxgl.Map({
   container: "map", // container id
   style: "mapbox://styles/mapbox/streets-v9", // stylesheet location
   center: [-0.195499, 51.52086], // starting position [lng, lat]
   zoom: 18 // starting zoom
 });
 map.addControl(new mapboxgl.NavigationControl());

 // On map load and move events, invoke the drawGrid function
 map.on("load", drawGrid).on("move", drawGrid);

 // Check to see if the requisit zoom level has been reached, and if so, draw the grid onto the map
 function drawGrid() {
   const zoom = map.getZoom();
   const loadFeatures = zoom > 17;

   if (loadFeatures) {
     // Zoom level is high enough
     var ne = map.getBounds().getNorthEast();
     var sw = map.getBounds().getSouthWest();

     // Call the what3words Grid API to obtain the grid squares within the current visble bounding box
     what3words.api
       .gridSectionGeoJson({
         southwest: {
           lat: sw.lat,
           lng: sw.lng
         },
         northeast: {
           lat: ne.lat,
           lng: ne.lng
         }
       })
       .then(function (data) {
         var grid = map.getSource("grid");

         if (grid === undefined) {
           map.addSource("grid", {
             type: "geojson",
             data: data
           });
           map.addLayer({
             id: "grid_layer",
             type: "line",
             source: "grid",
             layout: {
               "line-join": "round",
               "line-cap": "round"
             },
             paint: {
               "line-color": "#777",
               "line-width": 0.5
             }
           });
         } else {
           map.getSource("grid").setData(data);
         }
       })
       .catch(console.error);
   }

   var grid_layer = map.getLayer("grid_layer");
   if (typeof grid_layer !== "undefined") {
     map.setLayoutProperty(
       "grid_layer",
       "visibility",
       loadFeatures ? "visible" : "none"
     );
   }
 }