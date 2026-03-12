/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonButton,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { useState, useRef, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useStockDetail } from '../hooks/useStocks';
import { usePortfolio } from '../hooks/usePortfolio';
import { PriceChart } from '../components/PriceChart';

const priceContainer = css`
  text-align: center;
  padding: 16px 0 8px;
`;

const bigPrice = css`
  font-size: 2.5rem;
  font-weight: 700;
`;

const changeStyle = (positive: boolean) => css`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${positive ? '#4caf50' : '#f44336'};
  margin-top: 4px;
`;

const statLabel = css`
  font-size: 0.85rem;
  color: #888;
`;

const statValue = css`
  font-weight: 600;
`;

const centerStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  flex-direction: column;
  gap: 12px;
`;

const confirmOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const confirmBox = css`
  background: var(--ion-background-color, #fff);
  border-radius: 12px;
  padding: 24px;
  margin: 0 32px;
  max-width: 320px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const confirmTitle = css`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const confirmMessage = css`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 20px;
`;

const confirmActions = css`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const confirmBtn = css`
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
`;

const notesTextarea = css`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid var(--ion-color-medium, #999);
  border-radius: 8px;
  background: var(--ion-background-color, #fff);
  color: var(--ion-text-color, #000);
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: var(--ion-color-primary);
    box-shadow: 0 0 0 2px rgba(56, 128, 255, 0.2);
  }
`;

const notesActions = css`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  justify-content: flex-end;
`;

const saveBtn = css`
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: var(--ion-color-success, #4caf50);
  color: white;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const toastStyle = css`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  z-index: 10000;
  animation: slideUp 0.3s ease-out;
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const history = useHistory();
  const { data: detail, isLoading, error } = useStockDetail(symbol);
  const { portfolio, removeStock, isRemoving, updateNotes, isUpdatingNotes } = usePortfolio();
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Find current stock in portfolio to get notes
  const portfolioStock = portfolio?.stocks.find(
    (s) => s.symbol.toUpperCase() === symbol.toUpperCase()
  );

  // Initialize textarea with current notes
  useEffect(() => {
    if (notesRef.current && portfolioStock) {
      notesRef.current.value = portfolioStock.notes || '';
    }
  }, [portfolioStock]);

  const handleRemove = async () => {
    setShowConfirm(false);
    try {
      await removeStock(symbol);
      history.replace('/dashboard');
    } catch {
      // ignore
    }
  };

  const handleSaveNotes = async () => {
    const notes = notesRef.current?.value || '';
    try {
      await updateNotes({ symbol, notes });
      setToast({ message: 'Notes saved successfully', key: Date.now() });
      setTimeout(() => setToast(null), 2600);
    } catch {
      setToast({ message: 'Failed to save notes', key: Date.now() });
      setTimeout(() => setToast(null), 2600);
    }
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/dashboard" />
            </IonButtons>
            <IonTitle>{symbol}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div css={centerStyle}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !detail) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/dashboard" />
            </IonButtons>
            <IonTitle>{symbol}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div css={centerStyle}>
            <IonText color="danger">Failed to load stock data</IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const { stock, price_history } = detail;
  const price = parseFloat(stock.current_price);
  const change = parseFloat(stock.daily_change);
  const changePercent = parseFloat(stock.daily_change_percent);
  const isPositive = changePercent >= 0;
  const chartColor = isPositive ? '#4caf50' : '#f44336';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>{stock.symbol} - {stock.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div css={priceContainer}>
          <div css={bigPrice}>${price.toFixed(2)}</div>
          <div css={changeStyle(isPositive)}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        </div>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1rem' }}>Price Chart</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <PriceChart
              data={price_history}
              isLoading={false}
              color={chartColor}
            />
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1rem' }}>Statistics</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="none">
              <IonItem>
                <IonLabel css={statLabel}>52W High</IonLabel>
                <IonLabel slot="end" css={statValue}>${stock.high_52w.toFixed(2)}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel css={statLabel}>52W Low</IonLabel>
                <IonLabel slot="end" css={statValue}>${stock.low_52w.toFixed(2)}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel css={statLabel}>Volume</IonLabel>
                <IonLabel slot="end" css={statValue}>{stock.volume.toLocaleString()}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel css={statLabel}>Avg Volume</IonLabel>
                <IonLabel slot="end" css={statValue}>{stock.avg_volume.toLocaleString()}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel css={statLabel}>Market Cap</IonLabel>
                <IonLabel slot="end" css={statValue}>{formatLargeNumber(stock.market_cap)}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel css={statLabel}>Sector</IonLabel>
                <IonLabel slot="end" css={statValue}>{stock.sector}</IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1rem' }}>Notes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <textarea
              ref={notesRef}
              css={notesTextarea}
              placeholder="Add notes about this stock..."
            />
            <div css={notesActions}>
              <button
                css={saveBtn}
                onClick={handleSaveNotes}
                disabled={isUpdatingNotes}
              >
                {isUpdatingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </IonCardContent>
        </IonCard>

        <div style={{ padding: '16px' }}>
          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            onClick={() => !isRemoving && setShowConfirm(true)}
            style={isRemoving ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          >
            {isRemoving ? <IonSpinner name="dots" /> : 'Remove from Portfolio'}
          </IonButton>
        </div>

        {showConfirm && (
          <div css={confirmOverlay} onClick={() => setShowConfirm(false)}>
            <div css={confirmBox} onClick={(e) => e.stopPropagation()}>
              <div css={confirmTitle}>Remove Stock</div>
              <div css={confirmMessage}>
                Are you sure you want to remove {stock.symbol} from your portfolio?
              </div>
              <div css={confirmActions}>
                <button
                  css={[confirmBtn, css`background: #e0e0e0; color: #333;`]}
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  css={[confirmBtn, css`background: #f44336; color: white;`]}
                  onClick={handleRemove}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div key={toast.key} css={toastStyle}>
            {toast.message}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
