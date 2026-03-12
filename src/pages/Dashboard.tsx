/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { addOutline, logOutOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { useAuth } from '../hooks/useAuth';
import { StockCard } from '../components/StockCard';
import { PortfolioSummary } from '../components/PortfolioSummary';
import { useQueryClient } from '@tanstack/react-query';
import { Tag } from '../types/stock';

const centerStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  flex-direction: column;
  gap: 12px;
`;

const emptyStyle = css`
  text-align: center;
  margin-top: 80px;
  padding: 0 32px;
`;

const tagsFilterContainer = css`
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const tagFilterChip = (color: string, selected: boolean) => css`
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: 2px solid ${color};
  background: ${selected ? color : 'transparent'};
  color: ${selected ? '#fff' : color};
  transition: all 0.15s ease;
`;

const filterLabel = css`
  font-size: 0.85rem;
  color: #888;
  margin-right: 8px;
`;

export default function Dashboard() {
  const { portfolio, isLoading, error } = usePortfolio();
  const { logout } = useAuth();
  const history = useHistory();
  const queryClient = useQueryClient();
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  const handleStockClick = (symbol: string) => {
    history.push(`/stock/${symbol}`);
  };

  const handleLogout = () => {
    logout();
    history.replace('/login');
  };

  const handleRefresh = async (event: CustomEvent) => {
    await queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    (event.target as HTMLIonRefresherElement).complete();
  };

  const allTags = portfolio?.all_tags || [];
  const stocks = portfolio?.stocks || [];

  const filteredStocks = selectedTagId
    ? stocks.filter((s) => s.tags.some((t) => t.id === selectedTagId))
    : stocks;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {isLoading && (
          <div css={centerStyle}>
            <IonSpinner name="crescent" />
            <IonText color="medium">Loading portfolio...</IonText>
          </div>
        )}

        {error && (
          <div css={centerStyle}>
            <IonText color="danger">{error}</IonText>
            <IonButton fill="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['portfolio'] })}>
              Retry
            </IonButton>
          </div>
        )}

        {portfolio && portfolio.stocks.length === 0 && (
          <div css={emptyStyle}>
            <IonText color="medium">
              <h2>No stocks yet</h2>
              <p>Tap the + button to add stocks to your portfolio</p>
            </IonText>
          </div>
        )}

        {portfolio && portfolio.stocks.length > 0 && (
          <>
            <PortfolioSummary portfolio={portfolio} />

            {allTags.length > 0 && (
              <div css={tagsFilterContainer}>
                <span css={filterLabel}>Filter:</span>
                <span
                  css={tagFilterChip('#888', selectedTagId === null)}
                  onClick={() => setSelectedTagId(null)}
                >
                  All
                </span>
                {allTags.map((tag) => (
                  <span
                    key={tag.id}
                    css={tagFilterChip(tag.color, selectedTagId === tag.id)}
                    onClick={() => setSelectedTagId(tag.id)}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {filteredStocks.length === 0 && selectedTagId && (
              <div css={emptyStyle}>
                <IonText color="medium">
                  <h2>No stocks with this tag</h2>
                  <p>Try selecting a different tag or add tags to your stocks</p>
                </IonText>
              </div>
            )}

            {filteredStocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onClick={handleStockClick}
              />
            ))}
          </>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/add-stock')}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
}
