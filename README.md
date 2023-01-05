# NestJS ¿Monorepos y Microservicios?

[![wakatime](https://wakatime.com/badge/user/8ef73281-6d0a-4758-af11-fd880ca3009c/project/f748a666-7ffe-405f-a953-bfbf9434f6ff.svg)](https://wakatime.com/badge/user/8ef73281-6d0a-4758-af11-fd880ca3009c/project/f748a666-7ffe-405f-a953-bfbf9434f6ff)

## Tecnologías y Prácticas a implementar

![NestJs](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-orange?style=for-the-badge&logo=pnpm&logoColor=white)
![Redis](https://img.shields.io/badge/redis-CC0000.svg?&style=for-the-badge&logo=redis&logoColor=white)

- ***Node v18.12.1***
- ***pnpm*** gestor de paquetes del proyecto
- ***NestJS v9.1.8***
- ***Redis***

## Documentación

Para la generación del proyecto en modo ***standard*** usamos el siguiente comando:

```txt
nest new monorepo_project
```

Para crear un proyecto en modo ***monorepo*** debemos usar el siguiente comando dentro del directorio del proyecto:

```txt
nest generate app mail_app
```

El anterior comando cambia la estructura de nuestro directorio, creando una nueva carpeta llamada `apps` en donde se crea un directorio para el monorepo que creamos, y otra carpeta para el proyecto inicial.

Al momento de crear la nueva aplicación, vamos a tener el inconveniente de que los puertos se van a cruzar, por tal motivo debemos cambiar en alguno de los proyecto, el puesto por el cual se ha de escuchar. Una vez realizado el cambio lanzamos las aplicaciones de la siguiente manera:

- Para la aplicación principal usamos el comando:
  
  ```txt
  pnpm start
  ```

- Para la aplicación de monorepo usamos el comando:
  
  ```txt
  nest start mail_app --watch
  ```

Para hacer la implementación de los microservicios hacemos la instalación un módulo propio de Nest con el siguiente comando:

```txt
pnpm i -S @nestjs/microservices
```

Vamos a convertir en un microservicio la aplicación de `mail_app`, por lo que definimos que en vez de escuchar a través de un puerto, haga uso de una capa de transporte TCP (Transfer Control Protocole - Protocolo de Control de Transmisión) o mediante Redis, por donde fluirán los eventos entre aplicaciones:

```ts
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { MailAppModule } from './mailApp.module'

async function bootstrap () {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        MailAppModule,
        {
            transport: Transport.TCP
        },
    )

    await app.listen()
}
bootstrap()
```

Ahora necesitamos configurar el cliente, en este caso es el módulo de la aplicación principal, por lo que registramos el el servicio y con cual capa de transporte está funcionando:

```ts
import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { AppController } from './app.controller'
import { AppService } from './app.service'


@Module( {
    imports: [
        ClientsModule.register( [
            { name: 'MAILAPP_SERVICE', transport: Transport.TCP }
        ] )
    ],
    controllers: [ AppController ],
    providers: [ AppService ],
} )
export class AppModule { }
```

Para el envío de eventos vamos a dirigirnos al controlador de la MailApp y usamos el decorador `EventPattern`, en el cual definimos el nombre del evento que recibe acompañado de la lógica del evento:

```ts
import { Controller } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'

@Controller()
export class MailAppController {
    constructor ( ) { }

    @EventPattern( 'new_email' )
    handleNewMail ( data: unknown ) {
        console.log( { data } )
        //TODO: Lógica relacionada a la creación de un nuevo mail
    }
}
```

Para hacer uso del microservicio dentro de nuestra aplicación principal necesitamos hacer la inyección del mismo dentro del servicio dedicado a la tarea, en este caso será el `AppService`, en el cual se determina que la inyección sea de tipo `ClienteProxy`, para luego crear un método que se encargue de emitir la información al microservicio:

```ts
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class AppService {
    constructor ( @Inject( 'MAILAPP_SERVICE' ) private readonly _mailClient: ClientProxy ) { }

    newUser ( body: unknown ) {
        this._mailClient.emit( 'new_email', body )
        return 'Send_Queue'
    }
}
```

Siguiendo la estructura de NestJS, dentro del controlador creamos un método que reciba la información dentro del Body de la petición HTTP y lo envié al servicio (está claro que el body debería ser validado por un DTO, pero en estos momentos omitimos ello para solo ver cómo funciona el método):

```ts
import { Body, Controller, Post } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
    constructor ( private readonly _appService: AppService ) { }

    @Post( 'new-user' )
    public async newUser ( @Body() body: unknown ) {
        const fakeUser = {
            email: 'fake_user@microservice.com',
            name: 'Fake User',
            avatar: 'https://fake-image.com',
            password: 'FakePassword_1234'
        }
        body = ( Object.keys( body ).length ) ? body : fakeUser
        return this._appService.newUser( body )
    }
}
```

Cuando tenemos las dos aplicaciones levantadas podremos observar que si hacemos una petición POST al endpoint `localhost:3000/new-user` con un objeto en el body (o sin él y se enviará el `fakeUser`), nuestro microservicio imprime en consola la data que recibe.

Ahora, si queremos hacer uso de Redis, debemos hacer su instalación, en caso de Windows seguimos estos comandos en la PowerShell con permisos de administrador:

```txt
wsl --install
```

```txt
wsl --install -d <Nombre de la distribución Linux>
```

```txt
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
```

```txt
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
```

```txt
sudo apt-get update
```

```txt
sudo apt-get install redis
```

```txt
sudo service redis-server start
```

```txt
redis-cli 
```

```txt
127.0.0.1:6379> ping
```

Una vez tengamos instalado Redis en nuestro equipo, debemos pasar al directorio de nuestra aplicación e instalar el paquete dedicado con el siguiente comando (aprovechamos que es monorepo por lo que se comparten los paquetes entre las 2 aplicaciones que tenemos):

```txt
pnpm i -S ioredis
```

Luego, en el archivo `main.ts` de nuestro microservicio configuramos el transporte para que sea REDIS y definimos las opciones de conexión:

```ts
async function bootstrap () {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        ...,
        {
            transport: Transport.REDIS,
            options: {
                host: 'localhost',
                port: 6379
            }
        },
    )
    ...
}
```

Dentro del archivo `app.module.ts` debemos actualizar el registro del servicio con la siguiente información:

```ts
@Module( {
    imports: [
        ClientsModule.register( [
            {
                name: 'MAILAPP_SERVICE',
                transport: Transport.REDIS,
                options: {
                    host: 'localhost',
                    port: 6379
                }
            }
        ] )
    ],
    ...
} )
export class AppModule { }
```

Si hacemos la prueba de nuevo con el endpoint, podemos observar que todo irá de manera correcta.
