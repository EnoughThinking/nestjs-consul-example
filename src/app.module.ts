import { Module } from '@nestjs/common';
import { NestjsConsulKvRealtimeModule } from 'nestjs-consul-kv-realtime';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
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
})
export class AppModule {}
