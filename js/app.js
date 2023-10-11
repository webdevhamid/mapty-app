'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // KM
    this.duration = duration; // Min
  }

  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'Septempber',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDay()}`;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;

    // Instantly calculating pace
    this._calcPace();
    this._setDescription();
  }

  _calcPace() {
    this.pace = this.distance / this.duration;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;

    // Instantly calculating Speed
    this._calcSpeed();
    this._setDescription();
  }

  _calcSpeed() {
    // spedd = km/h
    this.speed = this.distance / (this.duration / 60);
  }
}

/////////////////////////////// APP //////////////////////////////
const form = document.querySelector('form');
const inputDistance = document.querySelector('.form-input-distance');
const inputDuration = document.querySelector('.form-input-duration');
const inputCadence = document.querySelector('.form-input-cadence');
const inputElevationGain = document.querySelector('.form-input-elevation');
const workoutType = document.querySelector('.form-input-type');

class App {
  #map;
  #clickedCoords;
  #workouts = [];
  #mapZoomLevel = 13;

  constructor() {
    // Methods calls from constructor will be executed instantly

    // Get users location
    this._getLocation();

    // Toggle Elevation Gain field
    this._toggleElevationGain();

    // Render workout on submit
    form.addEventListener('submit', this._renderWorkout.bind(this));
  }

  _getLocation() {
    // Check if browser support geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function (err) {
          alert(err.message);
        }
      );
    }
  }

  _loadMap(location) {
    const { latitude, longitude } = location.coords;

    // Initializing the map
    this.#map = L.map('map', {
      doubleClickZoom: false,
    }).setView([latitude, longitude], this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(popupEvent) {
    const { lat, lng } = popupEvent.latlng;
    this.#clickedCoords = [lat, lng];

    // Show form
    form.classList.remove('hidden');

    // Focus cursor on input Distance
    inputDistance.focus();
  }

  _toggleElevationGain() {
    // Change form input on change
    workoutType.addEventListener('change', function () {
      inputCadence.closest('.form-row').classList.toggle('form-row-hidden');
      inputElevationGain
        .closest('.form-row')
        .classList.toggle('form-row-hidden');
    });
  }

  _renderWorkout(event) {
    event.preventDefault();

    // Validate input data
    const checkInput = (...inputs) =>
      inputs.every((number) => Number.isFinite(number));

    const isPositiveNums = (...inputs) => inputs.every((number) => number > 0);

    let workout;

    // Get value from inputs
    const inputType = workoutType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    const elevationGain = +inputElevationGain.value;

    // Check if input type is running
    if (inputType === 'running') {
      if (
        checkInput(distance, duration, cadence) &&
        isPositiveNums(distance, duration, cadence)
      ) {
        workout = new Running(this.#clickedCoords, distance, duration, cadence);
      } else {
        return alert('Inputs have to be positive numbers!');
      }
    }

    // Check if input type is cycling
    if (inputType === 'cycling') {
      if (
        checkInput(distance, duration, elevationGain) &&
        isPositiveNums(distance, duration, elevationGain)
      ) {
        workout = new Cycling(
          this.#clickedCoords,
          distance,
          duration,
          elevationGain
        );
      } else {
        return alert('Inputs have to be positive numbers!');
      }
    }

    // Push new workout to the #workouts array
    this.#workouts.push(workout);

    // Render marker on the map
    this._renderMarker(workout);

    // Render new workout on the map
    this._renderNewWorkout(workout);
  }

  _renderMarker(workout) {
    L.marker(workout.coords, {
      draggable: true,
      autoPan: true,
    })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 500,
          minWidth: 200,
          autoClose: false,
          closeOnClick: false,
          className: `${
            workout.type === 'running' ? 'running' : 'cycling'
          }-popup`,
        })
      )
      .setPopupContent(`<h3>${workout.description}</h3>`)
      .openPopup();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputElevationGain.value =
      inputCadence.value =
        '';
    // Hide form
    form.style.display = 'none';
    form.classList.add('hidden');

    setTimeout(function () {
      form.style.display = 'grid';
    }, 1000);
  }

  _renderNewWorkout(workout) {
    const workoutEl = `
  <li class="workout workout-${workout.type}" data-id="${workout.id}">
      <h3 class="workout-title">${workout.description}</h3>
      <div class="workout-wrap">
        <div class="workout-details">
          <span class="workout-icon">${
            workout.type === 'running' ? '🏃' : '🚴'
          }</span>
          <span class="workout-value">${workout.distance}</span>
          <span class="workout-unit">KM</span>
        </div>
        <div class="workout-details">
          <span class="workout-icon">⌛</span>
          <span class="workout-value">${workout.duration}</span>
          <span class="workout-unit">Min</span>
        </div>
        <div class="workout-details">
          <span class="workout-icon">⚡️</span>
          <span class="workout-value">${
            workout.type === 'running' ? workout.pace : workout.speed
          }</span>
          <span class="workout-unit">${
            workout.type === 'running' ? 'MIN/KM' : 'KM/H'
          }</span>
        </div>
        <div class="workout-details">
          <span class="workout-icon">${
            workout.type === 'running' ? '🦶🏼' : '🏔️'
          }</span>
          <span class="workout-value">${
            workout.type === 'running' ? workout.cadence : workout.elevationGain
          }</span>
          <span class="workout-unit">${
            workout.type === 'running' ? 'SPM' : 'M'
          }</span>
        </div>
      </div>
   </li>
  `;

    // Hide form + clear input fields
    this._hideForm();

    // Render workout list on the sidebar
    form.insertAdjacentHTML('afterend', workoutEl);
  }
}

const app = new App();
