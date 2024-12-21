import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';

import { CityDto } from '../dto/city.dto';
import { WeatherService } from '../services/weather.service';
import { CityWeatherResponseDto } from '../dto/city-weather-response.dto';

jest.mock('axios');

describe('WeatherService', () => {
  let weatherService: WeatherService;
  let axiosPost: jest.Mock;
  let cacheManager: Cache;

  beforeEach(async () => {
    axiosPost = axios.post as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'OPEN_WEATHER_API_KEY':
                  return 'fake-key';
                case 'OPEN_CITY_WEATHER_API_URL':
                  return 'http://api.weather.com';
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    weatherService = module.get<WeatherService>(WeatherService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  describe('getCityCurrentWeather', () => {
    it('should return cached weather data if available', async () => {
      const cityDto: CityDto = { city: 'Dubai' };
      const mockWeatherData: CityWeatherResponseDto = {
        coord: { lon: 55.3047, lat: 25.2582 },
        weather: [{ id: 800 }],
        base: 'stations',
        main: { temp: 296.11 },
        visibility: 10000,
        wind: { speed: 2.57, deg: 40 },
        clouds: { all: 0 },
        dt: 1734709737,
        sys: { type: 1 },
        timezone: 14400,
        id: 292223,
        name: 'Dubai',
        cod: 200,
      };

      (cacheManager.get as jest.Mock).mockResolvedValueOnce(mockWeatherData);

      const result = await weatherService.getCityCurrentWeather(cityDto);

      expect(result).toEqual(mockWeatherData);
      expect(cacheManager.get).toHaveBeenCalledWith('city:weather:Dubai');
      expect(axiosPost).not.toHaveBeenCalled();
    });

    it('should fetch and cache weather data if not cached', async () => {
      const cityDto: CityDto = { city: 'Dubai' };
      const mockWeatherData: CityWeatherResponseDto = {
        coord: { lon: 55.3047, lat: 25.2582 },
        weather: [{ id: 800 }],
        base: 'stations',
        main: { temp: 296.11 },
        visibility: 10000,
        wind: { speed: 2.57, deg: 40 },
        clouds: { all: 0 },
        dt: 1734709737,
        sys: { type: 1 },
        timezone: 14400,
        id: 292223,
        name: 'Dubai',
        cod: 200,
      };

      (cacheManager.get as jest.Mock).mockResolvedValueOnce(null);
      axiosPost.mockResolvedValueOnce({ data: mockWeatherData });

      const result = await weatherService.getCityCurrentWeather(cityDto);

      expect(result).toEqual(mockWeatherData);
      expect(cacheManager.get).toHaveBeenCalledWith('city:weather:Dubai');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'city:weather:Dubai',
        mockWeatherData,
        3600000,
      );
      expect(axiosPost).toHaveBeenCalledWith(
        'http://api.weather.com?q=Dubai&appid=fake-key',
      );
    });

    it('should throw an error if weather data fetch fails due to city not found', async () => {
      const cityDto: CityDto = { city: 'rra' };
      const errorMessage = 'city not found';

      axiosPost.mockRejectedValueOnce({
        response: {
          status: HttpStatus.NOT_FOUND,
          data: { cod: 404, message: errorMessage },
        },
      });

      try {
        await weatherService.getCityCurrentWeather(cityDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toEqual(errorMessage);
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw BadRequestException if there is no response from axios', async () => {
      const cityDto: CityDto = { city: 'Test City' };

      axiosPost.mockRejectedValueOnce(new Error('Network error'));

      try {
        await weatherService.getCityCurrentWeather(cityDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Something went wrong!');
      }
    });
  });

  describe('fetchCityWeather', () => {
    it('should call axios and return weather data for a city', async () => {
      const city = 'Dubai';
      const mockWeatherData: CityWeatherResponseDto = {
        coord: { lon: 55.3047, lat: 25.2582 },
        weather: [{ id: 800 }],
        base: 'stations',
        main: { temp: 296.11 },
        visibility: 10000,
        wind: { speed: 2.57, deg: 40 },
        clouds: { all: 0 },
        dt: 1734709737,
        sys: { type: 1 },
        timezone: 14400,
        id: 292223,
        name: 'Dubai',
        cod: 200,
      };

      axiosPost.mockResolvedValueOnce({ data: mockWeatherData });

      const result = await weatherService['fetchCityWeather'](city);

      expect(result).toEqual(mockWeatherData);
      expect(axiosPost).toHaveBeenCalledWith(
        'http://api.weather.com?q=Dubai&appid=fake-key',
      );
    });

    it('should throw an error if axios call fails', async () => {
      const city = 'Test City';
      const errorMessage = 'API call failed';

      axiosPost.mockRejectedValueOnce({
        response: {
          status: HttpStatus.BAD_REQUEST,
          data: { message: errorMessage },
        },
      });

      try {
        await weatherService['fetchCityWeather'](city);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toEqual(errorMessage);
        expect(error.status).toEqual(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw a BadRequestException if axios call fails without response', async () => {
      const city = 'Test City';

      axiosPost.mockRejectedValueOnce(new Error('Network error'));

      try {
        await weatherService['fetchCityWeather'](city);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Something went wrong!');
      }
    });
  });
});
