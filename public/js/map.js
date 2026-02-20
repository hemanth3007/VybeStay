let mapToken = window.mapToken;
console.log(mapToken);
const key = mapToken;
const map = new maptilersdk.Map({
  container: "map",
  style: `https://api.maptiler.com/maps/streets/style.json?key=${window.mapToken}`,
  center: window.listing.geometry.coordinates, // MUST be [lng, lat]
  zoom: 12,
});

// To add new marker
new maptilersdk.Marker({ color: "#fe424d" })
  .setLngLat(window.listing.geometry.coordinates)
  .setPopup(
    new maptilersdk.Popup({ offset: 25 }).setHTML(
      `<h4><b>${listing.title}</b></h4><p>Exact location provided after booking!</p>`,
    ),
  )
  .addTo(map);
