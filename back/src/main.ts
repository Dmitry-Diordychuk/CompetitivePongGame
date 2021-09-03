if (!process.env.IS_TS_NODE) {
  require('module-alias/register')
}

import {AuthenticatedSocketAdapter} from "@app/shared/adapter/authenticatedSocket.adapter";
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //app.useWebSocketAdapter(new AuthenticatedSocketAdapter(app));

  await app.listen(3001);
}
bootstrap();
