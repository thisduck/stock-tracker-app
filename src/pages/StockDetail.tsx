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
import { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useStockDetail, useStockNotes, useStockNoteMutations } from '../hooks/useStocks';
import { usePortfolio } from '../hooks/usePortfolio';
import { PriceChart } from '../components/PriceChart';
import type { StockNote } from '../types/stock';

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

const notesCardTitle = css`
  font-size: 1rem;
`;

const noteForm = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const noteTextarea = css`
  width: 100%;
  min-height: 84px;
  border: 1px solid #d5d8dd;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.95rem;
  resize: vertical;
  font-family: inherit;
`;

const noteMeta = css`
  font-size: 0.78rem;
  color: #666;
`;

const noteItem = css`
  border: 1px solid #e6e8ed;
  border-radius: 10px;
  padding: 10px 12px;
  margin-top: 10px;
`;

const noteActions = css`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const plainButton = css`
  border: none;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
`;

const notesMessage = css`
  margin-top: 8px;
  font-size: 0.82rem;
  color: #555;
`;

function formatNoteDate(value: string | null): string {
  if (!value) return 'Unknown date';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return date.toLocaleString();
}

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
  const { data: notes = [], isLoading: isNotesLoading } = useStockNotes(symbol);
  const { createNote, updateNote, deleteNote, isCreating, isUpdating, isDeleting } = useStockNoteMutations(symbol);
  const { removeStock, isRemoving } = usePortfolio();
  const [showConfirm, setShowConfirm] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [noteStatus, setNoteStatus] = useState<string | null>(null);

  const handleRemove = async () => {
    setShowConfirm(false);
    try {
      await removeStock(symbol);
      history.replace('/dashboard');
    } catch {
      // ignore
    }
  };

  const handleCreateNote = async () => {
    const trimmed = newNoteContent.trim();
    if (!trimmed || isCreating) return;

    try {
      await createNote(trimmed);
      setNewNoteContent('');
      setNoteStatus('Note saved.');
    } catch {
      setNoteStatus('Could not save note.');
    }
  };

  const startEditNote = (note: StockNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleUpdateNote = async () => {
    const trimmed = editingContent.trim();
    if (!trimmed || !editingNoteId || isUpdating) return;

    try {
      await updateNote({ noteId: editingNoteId, content: trimmed });
      setNoteStatus('Note updated.');
      cancelEditNote();
    } catch {
      setNoteStatus('Could not update note.');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (isDeleting) return;

    try {
      await deleteNote(noteId);
      if (editingNoteId === noteId) {
        cancelEditNote();
      }
      setNoteStatus('Note deleted.');
    } catch {
      setNoteStatus('Could not delete note.');
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
            <IonCardTitle css={notesCardTitle}>Notes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div css={noteForm}>
              <textarea
                css={noteTextarea}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder={`Add a note about ${stock.symbol}...`}
              />
              <button
                css={[plainButton, css`background: #2f7ae5; color: white; align-self: flex-start;`]}
                onClick={handleCreateNote}
                style={isCreating ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
              >
                {isCreating ? 'Saving...' : 'Save Note'}
              </button>
            </div>

            {isNotesLoading ? (
              <div css={notesMessage}>Loading notes...</div>
            ) : notes.length === 0 ? (
              <div css={notesMessage}>No notes yet.</div>
            ) : (
              notes.map((note) => (
                <div key={note.id} css={noteItem}>
                  {editingNoteId === note.id ? (
                    <>
                      <textarea
                        css={noteTextarea}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                      />
                      <div css={noteActions}>
                        <button
                          css={[plainButton, css`background: #2f7ae5; color: white;`]}
                          onClick={handleUpdateNote}
                          style={isUpdating ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          css={[plainButton, css`background: #e6e8ed; color: #333;`]}
                          onClick={cancelEditNote}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>{note.content}</div>
                      <div css={noteMeta}>Updated {formatNoteDate(note.updated_at)}</div>
                      <div css={noteActions}>
                        <button
                          css={[plainButton, css`background: #e9f2ff; color: #215aa8;`]}
                          onClick={() => startEditNote(note)}
                        >
                          Edit
                        </button>
                        <button
                          css={[plainButton, css`background: #ffecec; color: #b03a3a;`]}
                          onClick={() => handleDeleteNote(note.id)}
                          style={isDeleting ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}

            {noteStatus && <div css={notesMessage}>{noteStatus}</div>}
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
      </IonContent>
    </IonPage>
  );
}
