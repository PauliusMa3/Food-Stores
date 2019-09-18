

import axios from 'axios';


const mapOptions = {
    center: {lat: 43.25, lng: -79.86},
    zoom: 13
}

function loadPlaces(map, lat=43.25, lng = -79.86) {
 axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then(res => {
        if (!res.data.length) {
            alert('No places were found!');
            return;
        }

        const bounds = new google.maps.LatLngBounds();
        const infoWindow = new google.maps.InfoWindow();

        const markers = res.data.map(place => {

            const[placeLng, placeLat] = place.location.coordinates;
            const position = {lat: placeLat, lng: placeLng};
            bounds.extend(position);
            const marker = new google.maps.Marker({
                position,
                map
            })

            marker.place = place;
            

            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);

            return marker;

        })

        markers.forEach(marker => marker.addListener('click', function() {
            console.log(this);
            const html = `<div class='popup'>
            <a href=/store/${this.place.slug}>
                <img src="/uploads/${this.place.photo || "store.png"}"/>
                <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
            </div>`
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        }));

        
    })
}



function makeMap (mapDiv) {

      const map = new google.maps.Map(mapDiv, mapOptions );

      const input = document.querySelector('[name="geolocate"]');

      const autocomplete = new google.maps.places.Autocomplete(input);

      loadPlaces(map);

      autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
      })

      console.log(input);
}

export default makeMap;