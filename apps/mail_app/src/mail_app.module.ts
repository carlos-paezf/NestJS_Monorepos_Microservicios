import { Module } from '@nestjs/common';
import { MailAppController } from './mail_app.controller';
import { MailAppService } from './mail_app.service';

@Module({
  imports: [],
  controllers: [MailAppController],
  providers: [MailAppService],
})
export class MailAppModule {}
