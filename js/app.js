const latlang = navigator.geolocation.getCurrentPosition(
  function (location) {
    const { latitude, longitude } = location.coords;
    const coords = [latitude, longitude];

    // Initializing Map
    const map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add a marker
    const marker = L.marker(coords).addTo(map);

    // Set the popup
    marker.bindPopup('<b>Hello world!</b><br>I am a popup.').openPopup();
  },
  function (err) {
    console.log(err);
  }
);
