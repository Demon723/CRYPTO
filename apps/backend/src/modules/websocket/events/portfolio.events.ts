import { Injectable } from '@nestjs/common';
import { WebsocketGateway } from '../websocket.gateway';

@Injectable()
export class PortfolioEvents {
  constructor(private readonly websocketGateway: WebsocketGateway) {}

  async broadcastPortfolioUpdate(userId: string, portfolio: any) {
    await this.websocketGateway.sendToUser(userId, 'portfolio:updated', {
      type: 'PORTFOLIO_UPDATED',
      data: portfolio,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastRiskScoreUpdate(userId: string, riskScore: any) {
    await this.websocketGateway.sendToUser(userId, 'risk:updated', {
      type: 'RISK_SCORE_UPDATED',
      data: riskScore,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastPriceAlert(userId: string, alert: any) {
    await this.websocketGateway.sendToUser(userId, 'price:alert', {
      type: 'PRICE_ALERT',
      data: alert,
      timestamp: new Date().toISOString(),
    });
  }
}
