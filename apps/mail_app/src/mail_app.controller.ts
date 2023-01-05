import { Controller } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { MailAppService } from './mail_app.service'



@Controller()
export class MailAppController {
    constructor ( private readonly mailAppService: MailAppService ) { }

    @EventPattern( 'new_email' )
    handleNewMail ( data: unknown ) {
        console.log( { data } )
        //TODO: Lógica relacionada a la creación de un nuevo mail
    }
}
