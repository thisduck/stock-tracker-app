/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const formContainer = css`
  max-width: 400px;
  margin: 60px auto 0;
  padding: 0 16px;
`;

const logoStyle = css`
  text-align: center;
  margin-bottom: 32px;
`;

const titleStyle = css`
  font-size: 2rem;
  font-weight: 700;
  color: var(--ion-color-primary);
`;

const subtitleStyle = css`
  font-size: 0.9rem;
  color: #888;
  margin-top: 4px;
`;

const errorStyle = css`
  margin: 12px 0;
  padding: 8px 12px;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
`;

const inputLabel = css`
  display: block;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
  padding-left: 2px;
`;

const inputStyle = css`
  width: 100%;
  padding: 12px 14px;
  font-size: 1rem;
  border: 1px solid var(--ion-color-medium, #999);
  border-radius: 8px;
  background: var(--ion-background-color, #fff);
  color: var(--ion-text-color, #000);
  outline: none;
  box-sizing: border-box;
  &:focus {
    border-color: var(--ion-color-primary);
    box-shadow: 0 0 0 2px rgba(56, 128, 255, 0.2);
  }
`;

const fieldGroup = css`
  margin-bottom: 16px;
`;

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loginError } = useAuth();
  const history = useHistory();

  const handleLogin = async () => {
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';
    if (!email && !password) {
      setErrorMsg('Please enter your email and password');
      return;
    }
    if (!email) {
      setErrorMsg('Please enter your email');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }
    setLoginLoading(true);
    setErrorMsg('');
    try {
      await login({ email, password });
      history.replace('/dashboard');
    } catch {
      setErrorMsg(loginError || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const displayError = errorMsg || loginError;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Stock Tracker</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div css={formContainer}>
          <div css={logoStyle}>
            <div css={titleStyle}>Stock Tracker</div>
            <div css={subtitleStyle}>Monitor your portfolio</div>
          </div>

          <div css={fieldGroup}>
            <label css={inputLabel}>Email</label>
            <input
              ref={emailRef}
              css={inputStyle}
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div css={fieldGroup}>
            <label css={inputLabel}>Password</label>
            <input
              ref={passwordRef}
              css={inputStyle}
              type="password"
              placeholder="Enter password"
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
            />
          </div>

          {displayError && (
            <div css={errorStyle}>
              <IonText color="danger">{displayError}</IonText>
            </div>
          )}

          <IonButton
            expand="block"
            disabled={loginLoading}
            style={{ marginTop: '24px' }}
            onClick={handleLogin}
          >
            {loginLoading ? <IonSpinner name="dots" /> : 'Sign In'}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
