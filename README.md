
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

The API documentation for this project is automatically generated using Swagger. Once the application is running, you can access the interactive API docs by navigating to `http://localhost:3000/api`

---

## Caching Strategy

The application uses Redis as an in-memory caching solution, providing fast and reliable storage of weather data ( cities weather & forecasts ). Redis is ideal for distributed systems and scalability as centrilzed cache store, making it well-suited for handling increased load as more servers are added in the future. Cached data is periodically refreshed based on a configurable Time-to-Live (TTL) to maintain freshness (deafault is 1h).

---

## Design Decisions & Assumptions

- **Weather API**: I chose [OpenWeatherMap](https://openweathermap.org/) as the third-party weather API because of its comprehensive features and ease of use.
- **Rate Limiting**: Rate limiting is configured to allow up to 25 requests per minute per IP to prevent overuse of the API (all configurable).
- **Error Handling**: I implemented custom error handling for better debugging and client feedback, in addition to robustness.
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
