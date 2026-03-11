/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { IonCard, IonCardContent } from '@ionic/react';
import { PortfolioStock } from '../types/stock';

interface StockCardProps {
  stock: PortfolioStock;
  onClick: (symbol: string) => void;
}

const cardStyle = css`
  margin: 8px 16px;
  cursor: pointer;
`;

const rowStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const symbolStyle = css`
  font-weight: 700;
  font-size: 1.1rem;
`;

const nameStyle = css`
  font-size: 0.85rem;
  color: #888;
`;

const noteIndicator = css`
  display: inline-block;
  font-size: 0.75rem;
  color: var(--ion-color-primary, #3880ff);
  margin-top: 2px;
`;

const priceStyle = css`
  text-align: right;
`;

const changeStyle = (positive: boolean) => css`
  color: ${positive ? '#4caf50' : '#f44336'};
  font-size: 0.9rem;
  font-weight: 600;
`;

export function StockCard({ stock, onClick }: StockCardProps) {
  const changePercent = parseFloat(stock.daily_change_percent);
  const isPositive = changePercent >= 0;

  return (
    <IonCard css={cardStyle} onClick={() => onClick(stock.symbol)}>
      <IonCardContent>
        <div css={rowStyle}>
          <div>
            <div css={symbolStyle}>{stock.symbol}</div>
            <div css={nameStyle}>{stock.name}</div>
            <div css={nameStyle}>{stock.sector}</div>
            {stock.has_note && <div css={noteIndicator}>Has note</div>}
          </div>
          <div css={priceStyle}>
            <div css={symbolStyle}>${parseFloat(stock.current_price).toFixed(2)}</div>
            <div css={changeStyle(isPositive)}>
              {isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
}
