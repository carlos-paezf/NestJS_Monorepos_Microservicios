import { Body, Controller, Post } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
    constructor ( private readonly _appService: AppService ) { }

    /**
     * It creates a new user.
     * @param {unknown} body - unknown
     * @returns The return value is a Promise of type User.
     */
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
