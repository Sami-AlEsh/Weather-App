import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { CustomLogger } from './common/helpers/custom.logger';
import { printSwaggerDocLabel } from './common/utils/swagger.utils';
import { AppExceptionFilter } from './common/filters/app-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new AppExceptionFilter());

  const configService = app.get(ConfigService);
  const isProd = configService.get<string>('NODE_ENV') === 'production';

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Weather App')
      .setDescription('The Weather App API description')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: "Please Provide JWT token without the 'Bearer ' keyword",
        in: 'header',
      })
      .addSecurityRequirements('bearer')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(3000);

  printSwaggerDocLabel(configService.get<number>('PORT')!, isProd);
}
bootstrap();
