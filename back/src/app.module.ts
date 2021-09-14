import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import ormconfig from "@app/ormconfig";
import {UserModule} from "@app/user/user.module";
import {ChatModule} from "@app/chat/chat.module";
import {ProfileModule} from "@app/profile/profile.module";
import {AchievementModule} from "@app/achievement/achievement.module";
import {TwoFactorAuthenticationModule} from "@app/two_factor_authentication/twoFactorAuthentication.module";
import {FriendModule} from "@app/friend/friend.module";
import {MatchModule} from "@app/match/match.module";

@Module({
  imports: [
      TypeOrmModule.forRoot(ormconfig),
      UserModule,
      ChatModule,
      ProfileModule,
      AchievementModule,
      TwoFactorAuthenticationModule,
      FriendModule,
      MatchModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
