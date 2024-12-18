import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './common/helpers/custom.logger';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

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
    `\n>> Swagger UI is available at http://localhost:${configService.get<number>('PORT')}/api\n`,
  );
}
bootstrap();
