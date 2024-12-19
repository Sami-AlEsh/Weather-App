export class CityWeatherResponse {
  coord: any;
  weather: any[];
  base: string;
  main: any;
  visibility: number;
  wind: any;
  clouds: any;
  dt: number;
  sys: any;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export class CityForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: any[];
  city: any;
}
