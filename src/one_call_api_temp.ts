import { readAllLineAnyOneColCSV, appendCSV, target_urls_all } from "../modules/module";
import fetch from "node-fetch";
import { config } from "dotenv";
import path from "path";

// .envファイルを絶対パスで参照するように変更
config({ path: path.resolve(__dirname, ".env") });
const API_KEY = process.env.WEATHER_API_KEY;
if (!API_KEY) {
  console.error("TOKEN NOT FOUND\n");
} else {
  console.log("TOKEN OK\n");
}

const BASE_URL = "https://api.openweathermap.org/data/3.0/onecall";

mainTemperature();
async function mainTemperature() {
  // 新temp/forecast用csvはscraping.csvとは別csvで管理する。
  // 今のscraping.csvの構造を変えた時のバグを防ぐため。
  const api_cities = readAllLineAnyOneColCSV("../city_list.csv", 1);
  const csv_cities = target_urls_all.map((line) => line[4]);
  // 今日(深夜2時)
  const now = new Date();
  const year = now.getFullYear();
  const date_for_api = formatDateForAPI(now);
  const date_for_csv = formatDateForCSV(now);
  console.log("temperature: " + now);
  // 順番はscraping.csvと同じ。そうなるようにcity_list.csvを作成する。
  for (let i = 0; i < api_cities.length; i++) {
    const avg_temp = await fetchTemperature(api_cities[i], date_for_api);
    const norm_count = getNormCount(i);
    console.log(`[${norm_count}/47] ${csv_cities[i]} (${api_cities[i]}): ${avg_temp}`);
    // TODO: temp-csvの2行目だけ読み込んで、nowを編集する
    saveTemperature(year, csv_cities[i], date_for_csv, avg_temp);
  }

}



interface Geo {
  lat: number;
  lon: number;
}
async function fetchTemperature(city: string, format_date: string): Promise<number> {
  const geo: Geo = await fetchGeo(city);
  isInJapan(geo.lat, geo.lon);

  const url = `
  ${BASE_URL}/day_summary?lat=${geo.lat}&lon=${geo.lon}
  &date=${format_date}&tz=+09:00&units=metric&lang=en&appid=${API_KEY}`;

  try {
    const data = await fetch(url);
    const res: any = await data.json();
    // console.log(city, res);
    const avg_temp: number = (res.temperature.min + res.temperature.max) / 2;
    return Math.round(avg_temp * 100) / 100;
  } catch (err) {
    throw new Error("Failed to fetch temperature: " + err);
  }

  function isInJapan(lat: number, lon: number): void | null {
    if (lat < 20 || lat > 45 || lon < 122 || lon > 153) {
      throw new Error("Not Japan or Invalid city name");
    }
  }
}

async function fetchGeo(city: string): Promise<Geo> {
  let url: string = "http://api.openweathermap.org/geo/1.0";
  url = `${url}/direct?q=${city},jp&limit=1&appid=${API_KEY}`;
  try {
    const data = await fetch(url);
    const res: any = await data.json();
    // console.log("GEO", res);
    return res[0];
  } catch (err) {
    console.error(err);
    return { lat: 0, lon: 0 };
  }
}

function formatDateForAPI(now: Date): string {
  // YYYY-MM-DD
  const year = String(now.getFullYear());
  let month = String(now.getMonth() + 1);
  let date = String(now.getDate());
  if (month.length === 1) month = "0" + month;
  if (date.length === 1) date = "0" + date;
  return `${year}-${month}-${date}`;
}
function formatDateForCSV(now: Date): string {
  // YYYY/M/D (0詰めをしない)
  return `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
}

function saveTemperature(year: number, city: string, date: string, temp: number): void {
  const file_name = `temperature_${year}.csv`;
  const temp_path = `../temperature/${city}/${file_name}`;
  appendCSV(temp_path, [date, temp]);
  // TODO: temp-csvの2行目だけ読み込んで、nowを編集する
}
function getNormCount(i: number): string {
  let norm_count: string = String(i + 1);
  norm_count = norm_count.length == 1 ? "0" + norm_count : norm_count;
  return norm_count
}
