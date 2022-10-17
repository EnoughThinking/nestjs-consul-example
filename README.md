<p align="center">
  <a href="https://dev.to/endykaufman/using-consul-kv-in-nestjs-dgd" target="blank"><img src="https://res.cloudinary.com/practicaldev/image/fetch/s--LvCaeT8a--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dzzsnischd4qem5kem1z.png"/></a>
</p>

Easily work with Consul Key/Value Store

# Links

https://developer.hashicorp.com/consul/docs/dynamic-app-config/kv - Key/Value (KV) Store

https://www.npmjs.com/package/ilink-console-tools - console. utility for upload/download env files to/from consul-kv

https://www.npmjs.com/package/nestjs-consul-kv-realtime - NestJS module for realtime work with Consul-KV

# Steps to create a project using nest and consul

## 1. Create NestJS project

### a) Create a new NestJS application with @nestjs/cli

```shell
npm i -g @nestjs/cli
nest new nestjs-consul-example
cd nestjs-consul-example
```

### b) Install dependencies

```shell
npm i --save consul nestjs-consul-kv-realtime
```

### c) Install devDependencies

```shell
npm i --save-dev ilink-console-tools @types/consul
```

## 2. Add work with Docker-compose

### a) Install docker-compose

https://docs.docker.com/compose/install

### b) Create nestjs-consul-example/docker-compose.yml

```yml
version: '3'
networks:
  nestjs-consul-example-network:
    driver: bridge

services:
  nestjs-consul-example:
    image: bitnami/consul:latest
    container_name: 'nestjs-consul-example'
    environment:
      - CONSUL_HTTP_TOKEN=${CONSUL_TOKEN_MASTER}
    networks:
      - nestjs-consul-example-network
    ports:
      - '8300:8300'
      - '8301:8301'
      - '8301:8301/udp'
      - '8500:8500'
      - '8600:8600'
      - '8600:8600/udp'
```

### c) Create nestjs-consul-example/env.docker-compose

```sh
CONSUL_HTTP_TOKEN=e2999fc6-1fc1-4345-a56e-e9d27b34c1c1
```

### d) Add new scripts to nestjs-consul-example/package.json

```json
{
  "scripts": {
    "__________dev infra__________": "__________dev infra__________",
    "docker:dev:restart": "npm run docker:dev:down && npm run docker:dev:up",
    "docker:dev:up": "set -a && . ./env.docker-compose && set +a && export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./docker-compose.yml --compatibility up -d",
    "docker:dev:down": "set -a && . ./env.docker-compose && set +a && export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./docker-compose.yml down"
  }
}
```

### e) Start docker-compose

```shell
npm run docker:dev:restart
```

## 3. Add default environment variables to consul

### a) Create nestjs-consul-example/env.default

```sh
HELLO_MESSAGE="Hello from ENV file!"
```

### b) Add new script and update exist in nestjs-consul-example/package.json

```json
{
  "scripts": {
    "__________dev infra__________": "__________dev infra__________",
    "docker:dev:restart": "npm run docker:dev:down && npm run docker:dev:up && npm run docker:dev:fill-default-data",
    "docker:dev:up": "set -a && . ./env.docker-compose && set +a && export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./docker-compose.yml --compatibility up -d",
    "docker:dev:down": "set -a && . ./env.docker-compose && set +a && export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./docker-compose.yml down",
    "docker:dev:fill-default-data": "set -a && . ./env.docker-compose && set +a && ilink-console-tools env-to-consul --path=./env.default --consul-token=$CONSUL_HTTP_TOKEN --consul-clear=true"
  }
}
```

### c) Restart docker-compose

```shell
npm run docker:dev:restart
```

### d) Navigate to http://localhost:8500/ui/dc1/kv/env/ and check data in UI

![content nestjs-consul-example/env.default in consul](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1gokcfme62ol0m9ex3lf.png)

## 4. Add NestjsConsulKvRealtimeModule to the application

### a) Update nestjs-consul-example/src/app.module.ts

```ts
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
```

### b) Update nestjs-consul-example/src/app.controller.ts

```ts
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
```

### c) Update nestjs-consul-example/tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true
  }
}
```

### d) Add new scripts to nestjs-consul-example/package.json

```json
{
  "scripts": {
    "start:dev": "set -a && . ./env.docker-compose && set +a && nest start --watch",
    "test": "npm run docker:dev:fill-default-data && set -a && . ./env.docker-compose && set +a && jest --forceExit"
  }
}
```

## 5. Update tests and test them

### a) Update exist test nestjs-consul-example/src/app.controller.spec.ts

```ts
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
```

### b) Run tests

```shell
npm run test
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fk69p7b9vlajcy7gbim1.png)
