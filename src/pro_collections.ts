import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org";

interface Geo {
  lat: number;
  lon: number;
}

async function fetchWeatherOrForecast(
  weatherOrForecast: string,
  city: string
): Promise<JSON | null> {
  const geo: Geo = await fetchGeo(city);
  isInJapan(geo.lat, geo.lon);

  let url: string = BASE_URL + "";
  url = `${url}/data/2.5/${weatherOrForecast}?lat=${geo.lat}&lon=${geo.lon}&lang=jp&appid=${API_KEY}`;

  try {
    const data = await fetch(url);
    const res = await data.json();
    return res;
  } catch (err) {
    console.error(err);
    return null;
  }

  async function fetchGeo(city: string): Promise<Geo> {
    let url: string = BASE_URL + "/geo/1.0";
    url = `${url}/direct?q=${city},jp&limit=1&appid=${API_KEY}`;
    try {
      const data = await fetch(url);
      const res = await data.json();
      console.log("GEO\n", res[0]);
      return res[0];
    } catch (err) {
      console.error(err);
      return { lat: 0, lon: 0 };
    }
  }
  function isInJapan(lat: number, lon: number): void | null {
    if (lat < 20 || lat > 45 || lon < 122 || lon > 153) {
      console.error("Not Japan or Invalid city name");
      return null;
    }
  }
  function setUrl(weather_of_forecast: string): string {
    if (weather_of_forecast == "weather") {
      url += "/weather";
    } else if (weather_of_forecast == "forecast") {
      url += "/forecast";
    } else {
      throw new Error("Invalid weather_or_forecast");
    }
    url = `${url}?lat=${geo.lat}&lon=${geo.lon}&lang=jp&appid=${API_KEY}`;
    return url;
  }
}


// main
main();
async function main() {
  const weather_or_forecast = "weather";
  const city = "Shinjuku";
  const weather = await fetchWeatherOrForecast(weather_or_forecast, city);

  console.log(weather_or_forecast, "\n", weather);
}
