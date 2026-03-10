/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useState, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
  IonButtons,
  IonBackButton,
  IonIcon,
} from '@ionic/react';
import { addCircleOutline, searchOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useStockSearch } from '../hooks/useStocks';
import { usePortfolio } from '../hooks/usePortfolio';
import type { StockSearchResult } from '../types/stock';

const RECENT_SEARCHES_KEY = 'recent_stock_searches';
const MAX_RECENT_SEARCHES = 5;

type RecentSearchItem = Pick<StockSearchResult, 'symbol' | 'name' | 'sector'>;

const centerStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40vh;
  flex-direction: column;
  gap: 8px;
`;

const hintStyle = css`
  text-align: center;
  margin-top: 60px;
  padding: 0 32px;
`;

const searchContainer = css`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
  border-bottom: 1px solid var(--ion-color-light, #e0e0e0);
`;

const searchInput = css`
  flex: 1;
  padding: 10px 12px;
  font-size: 1rem;
  border: 1px solid var(--ion-color-medium, #999);
  border-radius: 8px;
  background: var(--ion-background-color, #fff);
  color: var(--ion-text-color, #000);
  outline: none;
  &:focus {
    border-color: var(--ion-color-primary);
  }
  &::placeholder {
    color: #999;
  }
`;

export default function AddStock() {
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(0, MAX_RECENT_SEARCHES);
    } catch {
      return [];
    }
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  const { data: results, isLoading, error } = useStockSearch(searchText);
  const { addStock, isAdding } = usePortfolio();

  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchText(val), 300);
  }, []);

  const saveRecentSearch = (item: RecentSearchItem) => {
    setRecentSearches((current) => {
      const next = [item, ...current.filter((entry) => entry.symbol !== item.symbol)].slice(
        0,
        MAX_RECENT_SEARCHES,
      );
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleRecentSearchTap = (symbol: string) => {
    if (inputRef.current) {
      inputRef.current.value = symbol;
    }
    setSearchText(symbol);
  };

  const handleAdd = async (result: RecentSearchItem) => {
    try {
      saveRecentSearch(result);
      await addStock({ symbol: result.symbol });
      history.goBack();
    } catch {
      // stay on page if add fails
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Add Stock</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div css={searchContainer}>
          <IonIcon icon={searchOutline} style={{ fontSize: '1.2rem', color: '#999' }} />
          <input
            ref={inputRef}
            css={searchInput}
            type="text"
            placeholder="Search by symbol or name..."
            onChange={handleSearchInput}
            autoFocus
          />
        </div>

        {!searchText && (
          <>
            <div css={hintStyle}>
              <IonText color="medium">
                <p>Search for a stock by typing its symbol or company name</p>
              </IonText>
            </div>

            {recentSearches.length > 0 && (
              <IonList>
                <IonItem lines="full">
                  <IonLabel>
                    <h2>Recent Searches</h2>
                  </IonLabel>
                </IonItem>
                {recentSearches.map((item) => (
                  <IonItem key={item.symbol} button onClick={() => handleRecentSearchTap(item.symbol)}>
                    <IonLabel>
                      <h2>{item.symbol}</h2>
                      <p>{item.name}</p>
                    </IonLabel>
                    <IonIcon icon={searchOutline} slot="end" color="medium" />
                  </IonItem>
                ))}
              </IonList>
            )}
          </>
        )}

        {isLoading && (
          <div css={centerStyle}>
            <IonSpinner name="dots" />
          </div>
        )}

        {error && (
          <div css={centerStyle}>
            <IonText color="danger">Search failed. Try again.</IonText>
          </div>
        )}

        {results && results.length === 0 && searchText && (
          <div css={centerStyle}>
            <IonText color="medium">No results found for "{searchText}"</IonText>
          </div>
        )}

        {results && results.length > 0 && (
          <IonList>
            {results.map((result) => (
              <IonItem
                key={result.symbol}
                button
                onClick={() => !isAdding && handleAdd(result)}
                style={isAdding ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
              >
                <IonLabel>
                  <h2>{result.symbol}</h2>
                  <p>{result.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#aaa' }}>{result.sector}</p>
                </IonLabel>
                <IonIcon icon={addCircleOutline} slot="end" color="primary" />
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}
