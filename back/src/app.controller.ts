import { Controller, Get } from '@nestjs/common';
import { AppService } from '@app/app.service';

const fs = require('fs');
const v8 = require('v8');


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/heapdump')
  getDump() {
    const snapshotStream = v8.getHeapSnapshot();
    const filename = `${Date.now()}.heapsnapshot`;
    const filestream = fs.createWriteStream(filename);
    snapshotStream.pipe(filestream);
  }
}
