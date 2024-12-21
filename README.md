
# NestJS Weather API

This is a NestJS-based application that serves as a wrapper for a third-party weather API, providing additional features like caching, user favorite locations, rate limiting, and more. The application integrates with a weather API (`OpenWeatherMap`) to deliver current weather data and forecasts, while also allowing users to manage their favorite locations.

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/Sami-AlEsh/Weather-App.git
   ```

2. Install dependencies:

   ```bash
   cd weather-app
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory by duplicating `.env.example` file as starting template.

4. Run the application:

- #### Use Docker Compose for an easier setup

  With Docker Compose, you can automatically build and run the server along with the necessary databases (Postgres and Redis) in one command, please note that you need to create `.env.docker` file to be used which is similar to other env files but here you need to set the redis host to "redis" and postgres host to "postgres":

  ```bash
   docker-compose up --build
   ```

- Or you can use lunch the server only:

  ```bash
   npm run start
   ```

   This will start the NestJS server. The application will be available at `http://localhost:3000`.

---

## API Documentation

The API documentation for this project is automatically generated using Swagger. Once the application is running, you can access the interactive API docs by navigating to `http://localhost:3000/api`.

## Endpoints

### Get current weather for a given city

**GET** `/weather/{city}`

Retrieve current weather for a given city.

#### Parameters

- `city` (string, required): The city for which to retrieve weather information.

#### Response

Returns the current weather data in the following format:

```json
{
  "coord": { ... },
  "weather": [ ... ],
  "base": "string",
  "main": { ... },
  "visibility": 12345,
  "wind": { ... },
  "clouds": { ... },
  "dt": 1234567890,
  "sys": { ... },
  "timezone": 3600,
  "id": 123456,
  "name": "London",
  "cod": 200
}
```

### Get 5-day weather forecast for a city

**GET** `/forecast/{city}`

Retrieve a 5-day weather forecast for a given city.

#### Parameters

- `city` (string, required): The city for which to retrieve weather forecast.

#### Response

Returns the weather forecast in the following format:

```json
{
  "cod": "200",
  "message": 0,
  "cnt": 5,
  "list": [ ... ],
  "city": { ... }
}
```

### Get current user details

**GET** `/users/me`

Retrieve the details of the currently authenticated user.

#### Response

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

### Delete current user

**DELETE** `/users`

Deletes the currently authenticated user.

#### Response

No content is returned (HTTP status 204).

---

### Retrieve the user's favorite locations

**GET** `/users/locations`

Get a list of the user's favorite locations.

#### Response

```json
[
  {
    "id": 1,
    "city": "London",
    "country": "UK",
    "latitude": 51.5074,
    "longitude": -0.1278
  }
]
```

### Add a favorite location for the user

**POST** `/users/locations`

Adds a new favorite location for the user.

#### Request Body

```json
{
  "city": "London",
  "country": "UK",
  "latitude": 51.5074,
  "longitude": -0.1278
}
```

#### Response

```
{
  "id": 2,
  "city": "London",
  "country": "UK",
  "latitude": 51.5074,
  "longitude": -0.1278
}
```

### Delete a user favorite location

**DELETE** `/users/locations/{locationId}`

Deletes a user's favorite location.

#### Parameters

- `locationId` (number, required): The ID of the location to be deleted.

#### Response

No content is returned (HTTP status 204).

---

### Sign up a new user

**POST** `/auth/signup`

Sign up a new user.

#### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Login a user

**POST** `/auth/login`

Login a user with email and password.

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Response

```
{
  "access_token": "jwt_token_here"
}
```

### Refresh access token

**POST** `/auth/refresh`

Refresh access token and rotate the refresh token.

#### Response

```json
{
  "access_token": "new_jwt_token_here"
}
```

---

## Explanation of Caching Strategy

I designed the caching strategy to improve performance, reduce external API calls, and ensure scalability. Here’s how I approached it:

 1. **Redis for In-Memory Caching**:
I implemented Redis for fast, reliable in-memory caching of weather data. This reduces the need for repeated API calls to the external weather service, improving overall efficiency.

 2. **Centralized Caching**:
I implemented caching at the service level to ensure that any other service utilizing this service will automatically cache the response. This is to ensure that city data is efficiently cached and reused across the application. This approach guarantees consistent caching for both API responses and data fetched from users' favorite locations.

 3. **Efficient Data Caching**:
Weather data is cached for a configurable period (TTL). This setup ensures the data remains fresh while minimizing unnecessary requests to the external API.

 4. **Separation of Concerns & Scalability**:
I used Redis in combination with Bull queue to manage background jobs for weather updates. This separation ensures scalability, allowing the system to handle large numbers of locations efficiently without overloading the API or Redis.

 5. **Optimized Cache Hits**:
Cached data is reused whenever possible, allowing for faster responses. This not only boosts performance for API calls but also improves the user experience with favorite locations.

---

## Design Decisions & Assumptions

- **Weather API**: I chose [OpenWeatherMap](https://openweathermap.org/) as the third-party weather API because of its comprehensive features and ease of use.
- **Rate Limiting**: Rate limiting is configured to allow up to 25 requests per minute per IP to prevent overuse of the API (all configurable).
- **Error Handling**: I implemented custom error handling for better debugging and client feedback, in addition to robustness.
- **GraphQL Code-First Approach**: I adopted a GraphQL code-first approach instead of schema-first. This allows the GraphQL schema to be generated directly from the code, improving type safety, reducing manual schema management, and offering a more seamless development experience by keeping the GraphQL schema tightly integrated with the application code.
- **Custom Logger**: I implemented a custom logger to have more control over log formatting, including the ability to customize colors and other log details.
- **Authentication**: I designed an authentication system that uses access tokens with a 10-minute expiration and refresh tokens with a 7-day expiration (both configurable). Refresh tokens are stored in cookies following best practices, with the ability to refresh them when they are near expiry to keep active users connected as long as they remain active.
- **Traffic Logging**: A logging mechanism was added to monitor all incoming traffic to the server, including unauthorized access attempts. This is done via middleware before guards to capture all traffic.
- **Job Scheduling**: I set the job period for updating weather data for default locations (city weather + forecast) to 1 hour, as this timeframe allows for timely updates without overloading the system.
- **Weather Update Queue**: A queue was implemented to handle the weather update process for potentially large numbers of locations. This ensures scalability and efficient processing of weather data.
- **User Entity & APIs**: I created a user entity with sign-up and login APIs to manage users. Each user can retrieve their details or remove themselves. When a user deletes their account, all linked locations are also removed.
- **Caching Strategy**: I utilized caching inside the services instead of controllers (cache interceptor). This enables a centralized approach to cache any city the service tries to fetch data for, enhancing performance by caching cities fetched either via the API or from the user’s favorite locations.

---

## Testing

Unit tests have been written for the weather service and auth service. You can run the tests using:

```bash
npm run test
```
