const cityInput = document.querySelector('.city-input')
const searchbtn = document.querySelector('.srch-btn')

const notFoundsec = document.querySelector('.not-found-msg')
const searchCitysec = document.querySelector('.search-city-msg')
const weatherInfoSec = document.querySelector('.weather-info')
const weatherSummaryImg = document.querySelector('.main-icon')

const country = document.querySelector('.city-name')
const DnT = document.querySelector('.c-date-time')
const temp = document.querySelector('.degree')
const condition = document.querySelector('.condition')
const hum_Val = document.querySelector('.humidity_Value')
const aqi_Val = document.querySelector('.aqi_value')
const pres_Val = document.querySelector('.pressure_Value')
const wind_Val = document.querySelector('.wind_Value')
const weatherIcon = document.querySelector('.main-icon')
const dailyForecast = document.querySelector('.daily-forecast')

const apiKey = '259da17d6678c530c14724b68f707b44'

searchbtn.addEventListener('click', ()=>{
    if (cityInput.value.trim() !=''){
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

cityInput.addEventListener('keydown', (event) =>{
    if(event.key == "Enter" && cityInput.value.trim() !=''){
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

async function getFetchData(endPoint , city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`

    const response = await fetch(apiUrl)

    return response.json()
}

function getWeatherIcon(id){
    if ( id <= 232 ) return 'thunderstorm.apng'
    if ( id <= 531 ) return 'rain.apng'
    if ( id <= 622 ) return 'snow.apng'
    if ( id <= 799 ) return 'haze.apng'
    if ( id === 800 ) return 'clear.apng'
    else return 'cloud.apng'
}

async function updateWeatherInfo(city){
    const weatherData = await getFetchData('weather' , city)
    if(weatherData.cod != 200) {
        showDisplaySection(notFoundsec)
        return
    }
    console.log(weatherData)

    const{
        name: cityName,
        main: {temp: tempValue, humidity, pressure},
        weather: [{id, main}],
        wind: {speed},
        coord: { lat, lon }
    } = weatherData

    country.textContent = cityName
    temp.textContent = Math.round(tempValue) + '°C'
    condition.textContent = main
    hum_Val.textContent = humidity + ' %'
    pres_Val.textContent = pressure + ' mBar'
    // aqi_Val.textContent = humidity
    wind_Val.textContent = speed + ' m/s'

    weatherSummaryImg.src = `WSI/${getWeatherIcon(id)}`

    ////////////////////
    const aqiData = await getRealAQI(lat, lon);
    const realAQI = aqiData.hourly.us_aqi[0];

    aqi_Val.textContent = realAQI;

    ////////////////////

    await updateForecastInfo(city)
    showDisplaySection(weatherInfoSec)
}

async function updateForecastInfo(city){
    const forecastData = await getFetchData('forecast', city)
    const daysContainer = document.querySelector('.days')
    daysContainer.innerHTML = ""
    
    const timeTaken = '12:00:00';
    const dateTaken = new Date().toISOString().split('T')[0];

    // daily-forecast.innerHTML = ''
    forecastData.list.forEach(forecastWeather => {
        if(forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(dateTaken)){
            console.log(forecastWeather);
            updateForecastItems(forecastWeather)
        }
    })
    
    // console.log("Today:", dateTaken);
    // console.log("Filter Time:", timeTaken);
    
}
function updateForecastItems(weatherData){
    console.log(weatherData);
    const {
        dt_txt: date,
        weather: [{id}],
        main: {temp}
    } = weatherData

    const dateTaken = new Date(date)
    const dateOption = {
        day: '2-digit',
        month: 'short'
    }

    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption)

    const forecastItems = `
        <span class="material-symbols-outlined" id="daily-icon">
            <img src="/WSI/${getWeatherIcon(id)}" class="forecastIcon">
            <br>
            <h3 class="forecast">
                ${Math.round(temp)} °C
            </h3>
            <h4 class="day">
                ${dateResult}
            </h4>
        </span>
    `
    
    document.querySelector('.days').insertAdjacentHTML('beforeend', forecastItems)

}

    

function showDisplaySection(section){
    [weatherInfoSec, searchCitysec, notFoundsec]
    .forEach(section => section.style.display ='none')

    section.style.display = "block"
}


function updateDateTime() {
    const now = new Date()

    // readable parts
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const dayName = days[now.getDay()]
    const date = now.getDate()
    const month = months[now.getMonth()]

    let hours = now.getHours()
    let minutes = now.getMinutes()

    // add zero padding
    if (hours < 10) hours = "0" + hours
    if (minutes < 10) minutes = "0" + minutes

    DnT.innerHTML = `${dayName}<br>${date} ${month} | ${hours}:${minutes}`
}


/////////////////////

async function getRealAQI(lat, lon) {
    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi`;
    const res = await fetch(apiUrl);
    return res.json();
}


