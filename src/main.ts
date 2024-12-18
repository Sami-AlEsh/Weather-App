import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { CustomLogger } from './common/helpers/custom.logger';

/**
 * Print beautiful label in console for Swagger-Documentation url
 * @param port
 */
function printSwaggerDocLabel(port: number, isProd: boolean) {
  console.log(
    isProd
      ? `
    +-------------------------------------------------------------+
    |  ❌ Swagger Documentation is disabled in production env ❌  |
    +-------------------------------------------------------------+
    `
      : `
    +------------------------------------------------------------------------+
    |  ✅ Swagger Documentation is available on http://localhost:${port}/api ✅ |
    +------------------------------------------------------------------------+
    `,
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const configService = app.get(ConfigService);
  const isProd = configService.get<string>('NODE_ENV') === 'production';

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Weather App')
      .setDescription('The Weather App API description')
      .setVersion('1.0')
      .build();

    SwaggerModule.setup('api', app, () =>
      SwaggerModule.createDocument(app, config),
    );
  }

  await app.listen(3000);

  printSwaggerDocLabel(configService.get<number>('PORT')!, isProd);
}
bootstrap();
