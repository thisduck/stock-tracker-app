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
import { Tag } from '../types/stock';

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
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  background: var(--ion-background-color, #fff);
  color: var(--ion-text-color, #000);
`;

const tagsContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const tagChip = (color: string, selected: boolean) => css`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: 2px solid ${color};
  background: ${selected ? color : 'transparent'};
  color: ${selected ? '#fff' : color};
  transition: all 0.15s ease;
`;

const tagRemove = css`
  margin-left: 4px;
  font-size: 1rem;
  line-height: 1;
`;

const createTagForm = css`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const tagInput = css`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--ion-background-color, #fff);
  color: var(--ion-text-color, #000);
`;

const colorInput = css`
  width: 40px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
`;

const toastStyle = css`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  z-index: 10000;
  animation: fadeInOut 2.5s ease;
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
    90% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
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
  const {
    portfolio,
    updateNotes,
    isUpdatingNotes,
    attachTag,
    detachTag,
    isAttachingTag,
    isDetachingTag,
    createTag,
    isCreatingTag,
    removeStock,
    isRemoving,
  } = usePortfolio();
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const newTagNameRef = useRef<HTMLInputElement>(null);
  const newTagColorRef = useRef<HTMLInputElement>(null);

  const portfolioStock = portfolio?.stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
  const allTags = portfolio?.all_tags || [];
  const stockTags = portfolioStock?.tags || [];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveNotes = async () => {
    const notes = notesRef.current?.value || '';
    try {
      await updateNotes({ symbol, notes: notes || null });
      showToast('Notes saved');
    } catch {
      showToast('Failed to save notes');
    }
  };

  const handleTagClick = async (tag: Tag) => {
    const isAttached = stockTags.some((t) => t.id === tag.id);
    try {
      if (isAttached) {
        await detachTag({ symbol, tagId: tag.id });
        showToast('Tag removed');
      } else {
        await attachTag({ symbol, tagId: tag.id });
        showToast('Tag added');
      }
    } catch {
      showToast('Failed to update tag');
    }
  };

  const handleCreateTag = async () => {
    const name = newTagNameRef.current?.value?.trim();
    const color = newTagColorRef.current?.value || '#6200ea';
    if (!name) return;
    try {
      await createTag({ name, color });
      if (newTagNameRef.current) newTagNameRef.current.value = '';
      showToast('Tag created');
    } catch {
      showToast('Failed to create tag');
    }
  };

  const handleRemove = async () => {
    setShowConfirm(false);
    try {
      await removeStock(symbol);
      history.replace('/dashboard');
    } catch {
      showToast('Failed to remove stock');
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
              placeholder="Add your investment thesis, observations, or reminders..."
              defaultValue={portfolioStock?.notes || ''}
            />
            <div style={{ marginTop: '12px' }}>
              <IonButton
                size="small"
                onClick={handleSaveNotes}
                style={isUpdatingNotes ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
              >
                {isUpdatingNotes ? <IonSpinner name="dots" /> : 'Save Notes'}
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1rem' }}>Tags</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {allTags.length > 0 && (
              <div css={tagsContainer}>
                {allTags.map((tag) => {
                  const isSelected = stockTags.some((t) => t.id === tag.id);
                  return (
                    <span
                      key={tag.id}
                      css={tagChip(tag.color, isSelected)}
                      onClick={() => !isAttachingTag && !isDetachingTag && handleTagClick(tag)}
                    >
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            )}
            <div css={createTagForm}>
              <input
                ref={newTagNameRef}
                type="text"
                css={tagInput}
                placeholder="New tag name"
                maxLength={50}
              />
              <input
                ref={newTagColorRef}
                type="color"
                css={colorInput}
                defaultValue="#6200ea"
              />
              <IonButton
                size="small"
                onClick={handleCreateTag}
                style={isCreatingTag ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
              >
                {isCreatingTag ? <IonSpinner name="dots" /> : 'Add'}
              </IonButton>
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

        {toast && <div key={toast} css={toastStyle}>{toast}</div>}
      </IonContent>
    </IonPage>
  );
}
