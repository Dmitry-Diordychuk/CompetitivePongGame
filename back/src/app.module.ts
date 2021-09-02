import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import ormconfig from "@app/ormconfig";
import {UsersModule} from "@app/users/users.module";
import {ChatModule} from "@app/chat/chat.module";

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), UsersModule, ChatModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
