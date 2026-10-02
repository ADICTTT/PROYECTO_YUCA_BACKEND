import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde Angular (http://localhost:4200)
  app.enableCors({
    origin: [
      'http://localhost:4200',                // Para cuando pruebes en tu PC
      'https://proyecto-yuca.vercel.app'        // Reemplaza esto con la URL real que te dio Vercel
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  const config = new DocumentBuilder()
    .setTitle("PROYECTO BACKEND YUCA")
    .setDescription("Proyecto Yuca backend para la gestión de mesas")
    .setVersion('1.0')
    .addTag('ilustración')
    .addBearerAuth()
    .build();
    
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();