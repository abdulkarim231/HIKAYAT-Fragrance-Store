import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'wouter';
import { Check, Eye, EyeOff, Heart, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/application/auth-provider';
import { useUI } from '@/application/ui-provider';
import { useLocale } from '@/application/locale-provider';
import { useCart } from '@/application/cart-provider';
import { useWishlist } from '@/application/wishlist-provider';
import { btnGhost, btnPrimary } from '@/presentation/components/common/styles';
import type { MessageKey } from '@/i18n/messages';

type AuthMode = 'signIn' | 'signUp';
type Notice = { kind: 'success' | 'confirm'; message: string; title?: string } | null;

export function AccountDialog() {
  const { accountOpen, setAccountOpen } = useUI();
  const { t, dir } = useLocale();
  const { count } = useCart();
  const wishlist = useWishlist();
  const auth = useAuth();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!accountOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setFieldError({});
      setErrorMessage('');
      setNotice(null);
      setMode('signIn');
    }
  }, [accountOpen]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setFieldError({});
    setErrorMessage('');
    setNotice(null);
  };
  const close = () => {
    resetForm();
    setMode('signIn');
    setAccountOpen(false);
  };
  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    resetForm();
    setMode(next);
  };
  const errorText = (error: unknown) => {
    const code = auth.errorCode(error);
    const key: MessageKey = code ? `account.error.${code}` as MessageKey : 'account.error.generic';
    return t(key);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setNotice(null);
    const nextErrors: { email?: string; password?: string } = {};
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextErrors.email = t('account.validation.email');
    if (!password) nextErrors.password = t('account.validation.password');
    else if (mode === 'signUp' && password.length < 8) nextErrors.password = t('account.validation.passwordLength');
    setFieldError(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      const result = mode === 'signIn'
        ? await auth.signIn(normalizedEmail, password)
        : await auth.signUp(normalizedEmail, password);
      setPassword('');
      setShowPassword(false);
      if (result.requiresConfirmation) {
        setNotice({ kind: 'confirm', title: t('account.confirmTitle'), message: t('account.confirmBody') });
      } else {
        setNotice({
          kind: 'success',
          message: mode === 'signIn' ? t('account.toast.signedIn') : t('account.toast.created'),
        });
      }
    } catch (error) {
      setErrorMessage(errorText(error));
    }
  };
  const handleSignOut = async () => {
    setErrorMessage('');
    setNotice(null);
    try {
      await auth.signOut();
      resetForm();
      setNotice({ kind: 'success', message: t('account.toast.signedOut') });
    } catch (error) {
      setErrorMessage(errorText(error));
    }
  };

  return (
    <Dialog open={accountOpen} onOpenChange={(open) => open ? setAccountOpen(true) : close()}>
      <DialogContent
        dir={dir}
        className="w-[calc(100vw-1.5rem)] max-w-md overflow-hidden rounded-sm border-gold/30 bg-background p-0 sm:rounded-sm"
        data-testid="dialog-account"
      >
        <div className="relative overflow-hidden bg-olive px-7 pb-7 pt-9 text-ivory">
          <div aria-hidden="true" className="pointer-events-none absolute -end-12 -top-16 h-52 w-52 rounded-full border border-gold/25" />
          <div aria-hidden="true" className="pointer-events-none absolute -end-4 -top-8 h-36 w-36 rounded-full border border-gold/20" />
          <p className="logo-mark text-sm text-gold">HIKAYAT</p>
          <DialogTitle className="font-display mt-3 text-3xl font-normal">
            {auth.user ? t('account.welcome') : t('account.title')}
          </DialogTitle>
          <DialogDescription className="mt-3 max-w-sm text-sm leading-relaxed text-ivory/75">
            {auth.user ? auth.user.email : t('account.body')}
          </DialogDescription>
          <div className="mt-6 h-px w-16 bg-gold/70" />
        </div>

        <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto px-6 py-6 sm:px-7">
          {auth.loading ? (
            <div role="status" aria-live="polite" className="space-y-4 py-2" data-testid="status-auth-loading">
              <span className="sr-only">{t('account.checking')}</span>
              <div className="h-10 animate-pulse rounded-sm bg-sage/25" />
              <div className="h-12 animate-pulse rounded-sm bg-sage/25" />
              <div className="h-12 animate-pulse rounded-sm bg-sage/25" />
            </div>
          ) : auth.user ? (
            <div className="animate-in fade-in duration-300">
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-sage/25 text-olive">
                  <Check className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-xl text-olive">{t('account.memberSince')}</p>
                  <p className="mt-1 break-all text-sm text-muted-foreground">{auth.user.email}</p>
                </div>
              </div>
              {notice && <NoticePanel notice={notice} />}
              {errorMessage && <ErrorMessage message={errorMessage} />}
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={auth.pending}
                  className={btnGhost}
                  data-testid="button-sign-out"
                >
                  {auth.pending ? <span className="animate-pulse">{t('account.signOut')}</span> : t('account.signOut')}
                </button>
                <Link href="/bag" onClick={close} className={btnPrimary} data-testid="link-account-bag">
                  {t('account.viewBag')}
                </Link>
              </div>
              <div className="mt-2">
                <Link href="/wishlist" onClick={close} className={btnGhost} data-testid="link-account-wishlist">
                  {t('account.viewWishlist')}
                </Link>
              </div>
            </div>
          ) : (
            <>
              {auth.checkingError && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-sm border border-gold/40 bg-sage/15 p-3 text-sm" role="status">
                  <span>{t('account.checkError')}</span>
                  <button type="button" onClick={() => void auth.refresh()} className="shrink-0 underline underline-offset-4" data-testid="button-retry-auth">
                    {t('account.retry')}
                  </button>
                </div>
              )}

              <div className="mb-5 grid grid-cols-2 border-b border-border" role="group" aria-label={t('account.title')}>
                {(['signIn', 'signUp'] as const).map((authMode) => (
                  <button
                    key={authMode}
                    type="button"
                    aria-pressed={mode === authMode}
                    onClick={() => switchMode(authMode)}
                    className={`relative px-2 py-3 text-sm transition-colors duration-200 ${mode === authMode ? 'font-medium text-olive' : 'text-muted-foreground hover:text-olive'}`}
                    data-testid={`tab-account-${authMode}`}
                  >
                    {authMode === 'signIn' ? t('account.signIn') : t('account.create')}
                    {mode === authMode && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" />}
                  </button>
                ))}
              </div>

              {notice && <NoticePanel notice={notice} />}
              {errorMessage && <ErrorMessage message={errorMessage} />}

              <form onSubmit={submit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="account-email" className="mb-2 block text-xs tracking-wide text-charcoal/80">{t('account.email')}</label>
                  <input
                    id="account-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (fieldError.email) setFieldError((current) => ({ ...current, email: undefined }));
                    }}
                    aria-invalid={Boolean(fieldError.email)}
                    aria-describedby={fieldError.email ? 'account-email-error' : undefined}
                    className="h-12 w-full rounded-sm border border-input bg-card px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/70 focus:border-gold focus:ring-2 focus:ring-gold/20"
                    data-testid="input-account-email"
                  />
                  {fieldError.email && <p id="account-email-error" className="mt-1.5 text-xs text-destructive" role="alert">{fieldError.email}</p>}
                </div>

                <div>
                  <label htmlFor="account-password" className="mb-2 flex items-baseline justify-between gap-3 text-xs tracking-wide text-charcoal/80">
                    <span>{t('account.password')}</span>
                    {mode === 'signUp' && <span className="text-muted-foreground">{t('account.passwordHint')}</span>}
                  </label>
                  <div className="relative">
                    <input
                      id="account-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                      required
                      minLength={mode === 'signUp' ? 8 : undefined}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (fieldError.password) setFieldError((current) => ({ ...current, password: undefined }));
                      }}
                      aria-invalid={Boolean(fieldError.password)}
                      aria-describedby={fieldError.password ? 'account-password-error' : undefined}
                      className="h-12 w-full rounded-sm border border-input bg-card px-3 pe-12 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/70 focus:border-gold focus:ring-2 focus:ring-gold/20"
                      data-testid="input-account-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? t('account.hidePassword') : t('account.showPassword')}
                      className="absolute inset-y-0 end-0 flex w-12 items-center justify-center text-muted-foreground transition-colors hover:text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                    </button>
                  </div>
                  {fieldError.password && <p id="account-password-error" className="mt-1.5 text-xs text-destructive" role="alert">{fieldError.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={auth.pending}
                  className={`${btnPrimary} mt-1 w-full justify-center disabled:cursor-not-allowed disabled:opacity-65`}
                  data-testid="button-submit-auth"
                >
                  {auth.pending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-pulse rounded-full border border-current" aria-hidden="true" />
                      {mode === 'signIn' ? t('account.signIn') : t('account.create')}
                    </span>
                  ) : mode === 'signIn' ? t('account.submitSignIn') : t('account.submitCreate')}
                </button>
              </form>

              <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
                {mode === 'signIn' ? t('account.switchToCreate') : t('account.switchToSignIn')}
              </p>
            </>
          )}

          <div className="my-6 hairline" />
          <LocalStorageSummary count={count} wishlistCount={wishlist.count} t={t} />
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t('account.storedLocal')}</p>
          <p className="mt-4 flex gap-2 rounded-sm bg-sage/25 p-3 text-xs leading-relaxed text-charcoal/80">
            <ShieldCheck className="h-4 w-4 shrink-0 text-olive" strokeWidth={1.5} />
            {t('account.privacy')}
          </p>
          {!auth.user && (
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link href="/wishlist" onClick={close} className={btnGhost} data-testid="link-account-wishlist">{t('account.viewWishlist')}</Link>
              <Link href="/bag" onClick={close} className={btnPrimary} data-testid="link-account-bag">{t('account.viewBag')}</Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LocalStorageSummary({
  count,
  wishlistCount,
  t,
}: {
  count: number;
  wishlistCount: number;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
}) {
  return (
    <section aria-label={t('account.stored')}>
      <p className="eyebrow mb-3 text-olive">{t('account.stored')}</p>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-3"><ShoppingBag className="h-4 w-4 text-gold" strokeWidth={1.5} />{t('account.storedBag', { count })}</li>
        <li className="flex items-center gap-3"><Heart className="h-4 w-4 text-gold" strokeWidth={1.5} />{t('account.storedWishlist', { count: wishlistCount })}</li>
        <li className="flex items-center gap-3"><span className="h-4 w-4 text-center text-xs text-gold">Aa</span>{t('account.storedLang')}</li>
      </ul>
    </section>
  );
}

function NoticePanel({ notice }: { notice: Exclude<Notice, null> }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-4 flex gap-3 rounded-sm border p-3 text-sm leading-relaxed animate-in fade-in duration-300 ${notice.kind === 'confirm' ? 'border-gold/45 bg-gold/10 text-charcoal' : 'border-olive/20 bg-sage/20 text-olive'}`}
      data-testid={`status-auth-${notice.kind}`}
    >
      <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />
      <div>
        {notice.title && <p className="mb-1 font-medium">{notice.title}</p>}
        <p>{notice.message}</p>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-sm border border-destructive/25 bg-destructive/5 p-3 text-sm leading-relaxed text-destructive" role="alert" aria-live="assertive" data-testid="status-auth-error">
      {message}
    </p>
  );
}
