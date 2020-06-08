export const displayMap = locations =>{
    mapboxgl.accessToken = 'pk.eyJ1IjoibnZoYTYzIiwiYSI6ImNrOXRib3NvNzA3bzgzZW11dXZrNG4zdWcifQ.xL9NRuxiW-R8kCJIhkznYw';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/nvha63/ck9tce0io08281io0eobwyngr',
        scrollZoom: false,
        // center:[lng,lat],
        // zoom:10,
        // interactive:false
    });

    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach(loc => {
        // create marker
        const el = document.createElement('div');
        el.className = 'marker'
        //add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);
        //add popup
        new mapboxgl.Popup({
                offset: 30
            })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}:${loc.description}</p>`)
            .addTo(map);
        //extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    })
}

