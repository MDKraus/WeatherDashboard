// Replace 'YOUR_API_KEY' with your OpenWeatherMap API key
const apiKey = '309026f37ea804edb90479e22cc333fe';
const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM elements
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const cityName = document.getElementById('city-name');
const date = document.getElementById('date');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');
const historyList = document.getElementById('history-list');

// Function to fetch weather data
async function fetchWeather(city) {
    try {
        const response = await fetch(`${apiUrl}?q=${city}&appid=${apiKey}`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Function to convert temperature from Kelvin to Fahrenheit
function kelvinToFahrenheit(kelvin) {
    return (kelvin - 273.15) * 9/5 + 32; // Kelvin to Fahrenheit conversion formula
}

// Function to display weather data
function displayWeather(data) {
    if (data) {
        cityName.textContent = data.city.name;
        const temperatureValueKelvin = data.list[0].main.temp;

        // Display temperature in Fahrenheit
        const temperatureValueFahrenheit = kelvinToFahrenheit(temperatureValueKelvin);
        temperature.textContent = `Temperature: ${temperatureValueFahrenheit.toFixed(2)} °F`; // Rounded to 2 decimal places
        
        // You can also display the weather icon (assuming the API provides an icon code)
        const iconCode = data.list[0].weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
        weatherIcon.innerHTML = `<img src="${iconUrl}" alt="Weather Icon">`;
    } else {
        cityName.textContent = 'City not found';
        // Clear other weather information
        date.textContent = '';
        weatherIcon.innerHTML = '';
        temperature.textContent = '';
        humidity.textContent = '';
        windSpeed.textContent = '';
        forecastContainer.innerHTML = ''; // Clear forecast data
    }
}

// Function to display 5-day forecast
function displayForecast(data) {
    if (data) {
        forecastContainer.innerHTML = ''; // Clear previous forecast data
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Create an object to store forecast data by date
        const forecastByDate = {};

        // Iterate through the forecast data and group it by date
        data.list.forEach((forecastItem) => {
            const forecastDate = new Date(forecastItem.dt * 1000); // Convert timestamp to date
            const dateKey = forecastDate.toDateString(); // Use the date as a key

            if (!forecastByDate[dateKey]) {
                forecastByDate[dateKey] = [];
            }

            forecastByDate[dateKey].push(forecastItem);
        });

        // Display only unique dates (up to 5 days)
        let displayedDays = 0;

        for (const dateKey in forecastByDate) {
            if (displayedDays >= 5) {
                break;
            }

            const forecastItems = forecastByDate[dateKey];
            const firstItem = forecastItems[0];
            const forecastDate = new Date(firstItem.dt * 1000); // Use the first item's date
            const dayOfWeek = daysOfWeek[forecastDate.getDay()]; // Get the day of the week
            const month = forecastDate.getMonth() + 1; // Months are 0-based
            const day = forecastDate.getDate();

            const temperatureValueKelvin = firstItem.main.temp;
            const temperatureValueFahrenheit = kelvinToFahrenheit(temperatureValueKelvin); // Convert to Fahrenheit

            // Create a div element to display each forecast
            const forecastDiv = document.createElement('div');
            forecastDiv.classList.add('forecast-item');
            forecastDiv.innerHTML = `
                <div class="day-of-week">${dayOfWeek}</div>
                <div class="date-inside-box">${month}/${day}</div>
                <div class="weather-info">
                    <p>Temperature: ${temperatureValueFahrenheit.toFixed(2)} °F</p>
                    <p>Humidity: ${firstItem.main.humidity}%</p>
                    <p>Wind Speed: ${firstItem.wind.speed} m/s</p>
                </div>
            `;
            forecastContainer.appendChild(forecastDiv);

            displayedDays++;
        }
    } else {
        forecastContainer.innerHTML = 'No forecast data available';
    }
}

// Function to update the search history
function updateSearchHistory(city) {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
}

// Function to display search history
function displaySearchHistory() {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    historyList.innerHTML = ''; // Clear the history list

    searchHistory.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        listItem.classList.add('city-button');
        historyList.appendChild(listItem);
    });
}

// Function to initialize the search history in local storage if it doesn't exist
function initializeSearchHistory() {
    if (!localStorage.getItem('searchHistory')) {
        localStorage.setItem('searchHistory', JSON.stringify([]));
    }
}

// Call the initialization function when your JavaScript file loads
initializeSearchHistory();
displaySearchHistory(); // Display the search history initially

// Event listener for the history list items
historyList.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        const city = event.target.textContent;
        cityInput.value = city; // Set the input field value to the clicked city
        searchButton.click(); // Trigger a click on the search button to fetch and display data
    }
});

// Event listener for the search button
searchButton.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (city !== '') {
        const data = await fetchWeather(city);
        if (data) {
            displayWeather(data);
            displayForecast(data); // Display 5-day forecast
            cityInput.value = '';

            // Update the search history
            updateSearchHistory(city);

            // Display the updated search history
            displaySearchHistory();
        } else {
            // Display an error message if the city is not found
            cityName.textContent = 'City not found';
            // Clear other weather information and forecast
            date.textContent = '';
            weatherIcon.innerHTML = '';
            temperature.textContent = '';
            humidity.textContent = '';
            windSpeed.textContent = '';
            forecastContainer.innerHTML = '';
        }
    }
});

