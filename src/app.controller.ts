import { Controller, Get } from '@nestjs/common';
import { ConsulKeyValue } from 'nestjs-consul-kv-realtime';
import { AppService } from './app.service';

@Controller()
export class AppController {
  @ConsulKeyValue({
    key: 'env',
  })
  consulEnvironments!: { HELLO_MESSAGE: string };

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('consul')
  getConsulHello(): string {
    return this.consulEnvironments.HELLO_MESSAGE;
  }
}
