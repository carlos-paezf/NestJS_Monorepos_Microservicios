import { NestFactory } from '@nestjs/core';
import { MailappModule } from './mailapp.module';

async function bootstrap() {
  const app = await NestFactory.create(MailappModule);
  await app.listen(3000);
}
bootstrap();
