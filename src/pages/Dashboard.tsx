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
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonLabel,
} from '@ionic/react';
import { addOutline, logOutOutline, closeCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { useAuth } from '../hooks/useAuth';
import { StockCard } from '../components/StockCard';
import { PortfolioSummary } from '../components/PortfolioSummary';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

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

const filterBarStyle = css`
  padding: 16px;
  background: var(--ion-background-color);
  border-bottom: 1px solid var(--ion-border-color);
`;

const filterRowStyle = css`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const selectStyle = css`
  min-width: 140px;
`;

const chipStyle = css`
  margin: 4px;
`;

export default function Dashboard() {
  const { portfolio, isLoading, error } = usePortfolio();
  const { logout } = useAuth();
  const history = useHistory();
  const queryClient = useQueryClient();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  // Get unique sectors from portfolio
  const sectors = useMemo(() => {
    if (!portfolio) return [];
    const uniqueSectors = new Set(portfolio.stocks.map(s => s.sector));
    return Array.from(uniqueSectors).sort();
  }, [portfolio]);

  // Filter and sort stocks
  const filteredStocks = useMemo(() => {
    if (!portfolio) return [];

    let filtered = portfolio.stocks;

    // Apply search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(stock =>
        stock.symbol.toLowerCase().includes(search) ||
        stock.name.toLowerCase().includes(search)
      );
    }

    // Apply sector filter
    if (selectedSector !== 'all') {
      filtered = filtered.filter(stock => stock.sector === selectedSector);
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'change-desc':
        sorted.sort((a, b) => parseFloat(b.daily_change_percent) - parseFloat(a.daily_change_percent));
        break;
      case 'change-asc':
        sorted.sort((a, b) => parseFloat(a.daily_change_percent) - parseFloat(b.daily_change_percent));
        break;
      case 'price-desc':
        sorted.sort((a, b) => parseFloat(b.current_price) - parseFloat(a.current_price));
        break;
      case 'price-asc':
        sorted.sort((a, b) => parseFloat(a.current_price) - parseFloat(b.current_price));
        break;
      case 'symbol':
        sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
      default:
        // Keep original order
        break;
    }

    return sorted;
  }, [portfolio, searchText, selectedSector, sortBy]);

  const hasActiveFilters = searchText.trim() || selectedSector !== 'all' || sortBy !== 'default';

  const clearFilters = () => {
    setSearchText('');
    setSelectedSector('all');
    setSortBy('default');
  };

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
            <div css={filterBarStyle}>
              <IonSearchbar
                value={searchText}
                onIonInput={(e) => setSearchText(e.detail.value || '')}
                placeholder="Search by symbol or name"
                debounce={300}
              />
              <div css={filterRowStyle}>
                <IonSelect
                  css={selectStyle}
                  value={selectedSector}
                  placeholder="All Sectors"
                  onIonChange={(e) => setSelectedSector(e.detail.value)}
                >
                  <IonSelectOption value="all">All Sectors</IonSelectOption>
                  {sectors.map(sector => (
                    <IonSelectOption key={sector} value={sector}>
                      {sector}
                    </IonSelectOption>
                  ))}
                </IonSelect>

                <IonSelect
                  css={selectStyle}
                  value={sortBy}
                  placeholder="Sort By"
                  onIonChange={(e) => setSortBy(e.detail.value)}
                >
                  <IonSelectOption value="default">Default Order</IonSelectOption>
                  <IonSelectOption value="change-desc">Highest Gain</IonSelectOption>
                  <IonSelectOption value="change-asc">Lowest Gain</IonSelectOption>
                  <IonSelectOption value="price-desc">Highest Price</IonSelectOption>
                  <IonSelectOption value="price-asc">Lowest Price</IonSelectOption>
                  <IonSelectOption value="symbol">Symbol (A-Z)</IonSelectOption>
                </IonSelect>

                {hasActiveFilters && (
                  <IonChip css={chipStyle} onClick={clearFilters}>
                    <IonLabel>Clear Filters</IonLabel>
                    <IonIcon icon={closeCircle} />
                  </IonChip>
                )}
              </div>
            </div>

            <PortfolioSummary portfolio={portfolio} />

            {filteredStocks.length === 0 ? (
              <div css={emptyStyle}>
                <IonText color="medium">
                  <h3>No matching stocks</h3>
                  <p>Try adjusting your filters</p>
                </IonText>
              </div>
            ) : (
              filteredStocks.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  onClick={handleStockClick}
                />
              ))
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
