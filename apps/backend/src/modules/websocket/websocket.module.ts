import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { TransactionEvents } from './events/transaction.events';
import { PortfolioEvents } from './events/portfolio.events';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../common/modules/prisma.module';

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [WebsocketGateway, TransactionEvents, PortfolioEvents],
  exports: [WebsocketGateway, TransactionEvents, PortfolioEvents],
})
export class WebsocketModule {}
