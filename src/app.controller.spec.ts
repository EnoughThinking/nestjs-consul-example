import { Test, TestingModule } from '@nestjs/testing';
import Consul from 'consul';

import { NestjsConsulKvRealtimeModule } from 'nestjs-consul-kv-realtime';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        NestjsConsulKvRealtimeModule.forRootAsync({
          useFactory: async () => ({
            port: '8500',
            host: 'localhost',
            defaults: {
              token: process.env.CONSUL_HTTP_TOKEN,
            },
          }),
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    await app.init();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should return "Hello from ENV file!"', async () => {
      expect(appController.getConsulHello()).toBe('Hello from ENV file!');
    });

    it('should return "Hello from TEST!"', async () => {
      const consul = new Consul({
        port: '8500',
        host: 'localhost',
        defaults: {
          token: process.env.CONSUL_HTTP_TOKEN,
        },
      });

      await consul.kv.set('env/HELLO_MESSAGE', 'Hello from TEST!');

      expect(appController.getConsulHello()).not.toBe('Hello from TEST!');

      await new Promise((resolve) => setTimeout(resolve, 1500));

      expect(appController.getConsulHello()).toBe('Hello from TEST!');
    });
  });
});
