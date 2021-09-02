import {Module} from "@nestjs/common";
import {UsersController} from "@app/users/users.controller";
import {UsersService} from "@app/users/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersEntity} from "@app/users/users.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UsersEntity])],
    controllers: [UsersController],
    providers: [UsersService]
})
export class UsersModule {}
