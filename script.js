const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY = 'YOUR_API_KEY';

// Update time and date every second
setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML = (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + `<span id="am-pm">${ampm}</span>`;
    dateEl.innerHTML = days[day] + ', ' + date + ' ' + months[month];
}, 1000);

// Default to Dhaka, Bangladesh coordinates
const dhakaLat = 23.8041;
const dhakaLon = 90.4152;

// Get weather data based on geolocation or default to Dhaka, Bangladesh
getWeatherData();
function getWeatherData() {
    fetchWeatherData(dhakaLat, dhakaLon); // Default to Dhaka first
    
    // Try to get geolocation if available
    navigator.geolocation.getCurrentPosition((success) => {
        let { latitude, longitude } = success.coords;
        fetchWeatherData(latitude, longitude);
    }, () => {
        // If location access is denied or unavailable, keep Dhaka as default
        console.log('Geolocation not available. Defaulting to Dhaka, Bangladesh.');
    });
}

// Fetch weather data with provided latitude and longitude
function fetchWeatherData(latitude, longitude) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            showWeatherData(data);
        });
}

// Show weather data
function showWeatherData(data) {
    let { humidity, pressure, sunrise, sunset, wind_speed } = data.current;

    timezone.innerHTML = data.timezone;
    countryEl.innerHTML = data.lat + 'N ' + data.lon + 'E';

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item">
            <div>Humidity</div>
            <div>${humidity}%</div>
        </div>
        <div class="weather-item">
            <div>Pressure</div>
            <div>${pressure} hPa</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed</div>
            <div>${wind_speed} m/s</div>
        </div>
        <div class="weather-item">
            <div>Sunrise</div>
            <div>${window.moment(sunrise * 1000).format('HH:mm a')}</div>
        </div>
        <div class="weather-item">
            <div>Sunset</div>
            <div>${window.moment(sunset * 1000).format('HH:mm a')}</div>
        </div>
    `;

    let otherDayForcast = '';
    data.daily.forEach((day, idx) => {
        if (idx == 0) {
            currentTempEl.innerHTML = `
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png" alt="weather icon" class="w-icon">
                <div class="other">
                    <div class="day">${window.moment(day.dt * 1000).format('dddd')}</div>
                    <div class="temp">Night - ${day.temp.night}&#176;C</div>
                    <div class="temp">Day - ${day.temp.day}&#176;C</div>
                </div>
            `;
        } else {
            otherDayForcast += `
                <div class="weather-forecast-item">
                    <div class="day">${window.moment(day.dt * 1000).format('ddd')}</div>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                    <div class="temp">Night - ${day.temp.night}&#176;C</div>
                    <div class="temp">Day - ${day.temp.day}&#176;C</div>
                </div>
            `;
        }
    });

    weatherForecastEl.innerHTML = otherDayForcast;
}

// City search functionality
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getCityWeatherData(city);
    }
});

// Fetch weather data for the entered city
function getCityWeatherData(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            if (data.cod === 200) {
                updateWeatherDataForCity(data);
            } else {
                alert('City not found');
            }
        })
        .catch(error => console.error('Error fetching city weather:', error));
}

// Update weather data in the UI for the entered city
function updateWeatherDataForCity(data) {
    const { main: { humidity, pressure, temp }, wind: { speed }, sys: { country }, weather, name, coord } = data;
    const { icon } = weather[0];

    timezone.innerHTML = name;
    countryEl.innerHTML = country;

    // Get the current date for the searched city
    const currentCityDate = new Date(); // This will use the local timezone
    const cityDate = currentCityDate.toLocaleDateString(); // Format date as needed

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item">
            <div>Humidity</div>
            <div>${humidity}%</div>
        </div>
        <div class="weather-item">
            <div>Pressure</div>
            <div>${pressure} hPa</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed</div>
            <div>${speed} m/s</div>
        </div>
        <div class="weather-item">
            <div>Date</div>
            <div>${cityDate}</div>
        </div>
    `;

    currentTempEl.innerHTML = `
        <img src="http://openweathermap.org/img/wn/${icon}@4x.png" alt="weather icon" class="w-icon">
        <div class="other">
            <div class="day">${window.moment().format('dddd')}</div>
            <div class="temp">Current Temperature - ${temp}&#176;C</div>
        </div>
    `;

    // Fetch 7-day weather forecast for the searched city using its coordinates
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            showWeatherData(data);
        });
}
