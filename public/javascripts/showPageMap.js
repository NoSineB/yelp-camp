
mapboxgl.accessToken = mapToken;
lngLag = JSON.parse(lngLag)
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: [lngLag[0], lngLag[1]], // starting position [lng, lat]
    zoom: 4, // starting zoom
});

const marker = new mapboxgl.Marker()
    .setLngLat([lngLag[0], lngLag[1]])
    .setPopup(
        new mapboxgl.Popup({offset: 25})
            .setHTML(
                `<h5>${title}</h5>`
            )
    )
    .addTo(map);
