/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { PortfolioResponse } from '../types/stock';

interface PortfolioSummaryProps {
  portfolio: PortfolioResponse;
}

const summaryCard = css`
  margin: 16px;
  --background: linear-gradient(135deg, #1a237e, #283593);
  color: white;
`;

const valueStyle = css`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const changeRow = css`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const changeStyle = (positive: boolean) => css`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${positive ? '#69f0ae' : '#ff5252'};
`;

const arrowStyle = (positive: boolean) => css`
  font-size: 0.9rem;
  margin-right: 4px;
`;

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const { summary } = portfolio;
  const isPositive = summary.total_daily_change >= 0;
  const changePercent = summary.total_value > 0
    ? (summary.total_daily_change / summary.total_value) * 100
    : 0;

  return (
    <IonCard css={summaryCard}>
      <IonCardHeader>
        <IonCardTitle style={{ color: 'white', fontSize: '0.9rem' }}>
          Portfolio Value ({summary.total_stocks} stocks)
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div css={valueStyle}>${summary.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div css={changeRow}>
          <span css={changeStyle(isPositive)}>
            <span css={arrowStyle(isPositive)}>{isPositive ? '📈' : '📉'}</span>
            {isPositive ? '+' : ''}${summary.total_daily_change.toFixed(2)}
          </span>
          <span css={changeStyle(isPositive)}>
            ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
          <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Today</span>
        </div>
      </IonCardContent>
    </IonCard>
  );
}
