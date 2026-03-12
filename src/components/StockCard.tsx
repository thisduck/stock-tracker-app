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

const priceStyle = css`
  text-align: right;
`;

const changeStyle = (positive: boolean) => css`
  color: ${positive ? '#4caf50' : '#f44336'};
  font-size: 0.9rem;
  font-weight: 600;
`;

const tagsContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const tagChip = (color: string) => css`
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${color}22;
  color: ${color};
  border: 1px solid ${color}44;
`;

const notesIndicator = css`
  font-size: 0.75rem;
  color: #888;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
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
          </div>
          <div css={priceStyle}>
            <div css={symbolStyle}>${parseFloat(stock.current_price).toFixed(2)}</div>
            <div css={changeStyle(isPositive)}>
              {isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
        {(stock.tags.length > 0 || stock.notes) && (
          <div style={{ marginTop: '8px' }}>
            {stock.tags.length > 0 && (
              <div css={tagsContainer}>
                {stock.tags.map((tag) => (
                  <span key={tag.id} css={tagChip(tag.color)}>
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            {stock.notes && (
              <div css={notesIndicator}>
                <span>&#128221;</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {stock.notes.substring(0, 50)}{stock.notes.length > 50 ? '...' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
}
