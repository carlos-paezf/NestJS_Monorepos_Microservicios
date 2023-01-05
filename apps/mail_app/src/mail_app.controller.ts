import { Controller, Get } from '@nestjs/common';
import { MailAppService } from './mail_app.service';

@Controller()
export class MailAppController {
  constructor(private readonly mailAppService: MailAppService) {}

  @Get()
  getHello(): string {
    return this.mailAppService.getHello();
  }
}
