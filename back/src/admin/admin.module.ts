import {Module} from "@nestjs/common";
import {AdminController} from "@app/admin/admin.controller";
import {AdminService} from "@app/admin/admin.service";

@Module({
    imports: [],
    controllers: [AdminController],
    providers: [AdminService],
    exports: []
})
export class AdminModule {}