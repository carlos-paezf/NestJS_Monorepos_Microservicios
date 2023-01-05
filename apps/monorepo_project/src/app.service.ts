import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class AppService {
    constructor ( @Inject( 'MAILAPP_SERVICE' ) private readonly _mailClient: ClientProxy ) { }

    /**
     * It sends an email to the user.
     * @param {unknown} body - The body of the email.
     * @returns The string 'Send_Queue' is being returned.
     */
    public newUser ( body: unknown ) {
        this._mailClient.emit( 'new_email', body )
        return 'Send_Queue'
    }
}
