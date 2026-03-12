/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo, useState } from 'react';
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
import { usePortfolio } from '../hooks/usePortfolio';
import { useAuth } from '../hooks/useAuth';
import { StockCard } from '../components/StockCard';
import { PortfolioSummary } from '../components/PortfolioSummary';
import { useQueryClient } from '@tanstack/react-query';

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

const filterRow = css`
  display: flex;
  gap: 8px;
  padding: 4px 16px 8px;
  overflow-x: auto;
`;

const filterChip = (active: boolean) => css`
  border: 1px solid ${active ? '#2158c9' : '#c8d2ea'};
  background: ${active ? '#2158c9' : '#ffffff'};
  color: ${active ? '#ffffff' : '#2f3d66'};
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
`;

export default function Dashboard() {
  const { portfolio, isLoading, error } = usePortfolio();
  const { logout } = useAuth();
  const history = useHistory();
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState('all');

  const availableTags = useMemo(() => {
    if (!portfolio) return [];
    const tags = new Set<string>();
    for (const stock of portfolio.stocks) {
      for (const tag of stock.tags) {
        tags.add(tag);
      }
    }
    return Array.from(tags).sort();
  }, [portfolio]);

  const visibleStocks = useMemo(() => {
    if (!portfolio) return [];
    if (selectedTag === 'all') return portfolio.stocks;
    return portfolio.stocks.filter((stock) => stock.tags.includes(selectedTag));
  }, [portfolio, selectedTag]);

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

            <div css={filterRow}>
              <button css={filterChip(selectedTag === 'all')} onClick={() => setSelectedTag('all')}>
                All
              </button>
              {availableTags.map((tag) => (
                <button key={tag} css={filterChip(selectedTag === tag)} onClick={() => setSelectedTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>

            {visibleStocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onClick={handleStockClick}
              />
            ))}

            {visibleStocks.length === 0 && (
              <div css={emptyStyle}>
                <IonText color="medium">
                  <h2>No stocks for this tag</h2>
                  <p>Choose another tag or select All.</p>
                </IonText>
              </div>
            )}
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
