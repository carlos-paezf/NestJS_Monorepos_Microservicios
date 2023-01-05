import { Controller, Get } from '@nestjs/common';
import { MailappService } from './mailapp.service';

@Controller()
export class MailappController {
  constructor(private readonly mailappService: MailappService) {}

  @Get()
  getHello(): string {
    return this.mailappService.getHello();
  }
}
