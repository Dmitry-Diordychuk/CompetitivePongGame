import {Module} from "@nestjs/common";
import {ClientInfoService} from "@app/clientInfo/clientInfo.service";

@Module({
    imports: [],
    controllers: [],
    providers: [ClientInfoService],
    exports: [ClientInfoService]
})
export class ClientInfoModule {}
