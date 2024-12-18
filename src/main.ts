import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { CustomLogger } from './common/helpers/custom.logger';

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

  if (configService.get<string>('NODE_ENV') !== 'production') {
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

  console.log(
    `\n>> Swagger UI is available at http://localhost:${configService.get<number>('PORT')!}/api\n`,
  );
}
bootstrap();
