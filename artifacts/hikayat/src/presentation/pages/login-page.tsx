import { useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { useLocale } from '@/application/locale-provider';
import { useAuth } from '@/application/auth-provider';
import { AuthForm } from '@/presentation/components/auth/auth-form';
import { assetUrl } from '@/infrastructure/assets';

export default function LoginPage() {
  const { t, dir } = useLocale();
  const { user } = useAuth();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${t('login.title')} — HIKAYAT`;
    return () => { document.title = previousTitle; };
  }, [t]);

  return (
    <section aria-labelledby="login-heading" dir={dir} className="min-h-[62vh] overflow-hidden pb-16 pt-8 sm:pb-24 sm:pt-12">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 px-4 sm:px-8 lg:min-h-[610px] lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
        <section className="relative order-2 flex min-h-[420px] flex-col justify-end overflow-hidden bg-olive px-7 py-8 text-ivory sm:min-h-[520px] sm:px-11 sm:py-10 lg:order-1 lg:min-h-[610px] lg:px-12 lg:py-12">
          <img src={assetUrl('images/hero.jpg')} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-olive/90 via-olive/25 to-olive/10" aria-hidden="true" />
          <div className="absolute inset-5 border border-ivory/30 sm:inset-7" aria-hidden="true" />
          <div className="relative z-10 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-700">
            <p className="eyebrow mb-4 text-gold">{t('login.imageEyebrow')}</p>
            <h2 className="font-display text-4xl leading-[1.12] text-ivory sm:text-5xl">{t('login.imageTitle')}</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-ivory/80">{t('login.imageBody')}</p>
            <div className="mt-8 flex items-center gap-3 text-xs tracking-[0.12em] text-ivory/75">
              <span className="h-px w-10 bg-gold" /> {t('login.imageCaption')}
            </div>
          </div>
        </section>

        <section className="order-1 flex items-center bg-card px-5 py-10 sm:px-12 sm:py-14 lg:order-2 lg:px-[clamp(2.5rem,7vw,6.5rem)] lg:py-16">
          <div className="mx-auto w-full max-w-[440px] animate-in fade-in duration-700">
            <p className="eyebrow text-gold">{t('login.eyebrow')}</p>
            <h1 id="login-heading" className="font-display mt-4 text-4xl leading-tight text-olive sm:text-5xl">{user ? t('account.welcome') : t('login.title')}</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
              {user ? t('login.signedInBody') : t('login.body')}
            </p>
            <div className="my-8 h-px w-full bg-gradient-to-r from-gold/70 via-gold/25 to-transparent" />
            <AuthForm />
            <div className="mt-9 border-t border-border pt-5">
              <Link href="/shop" className="group inline-flex items-center gap-2 text-xs tracking-wide text-olive transition-colors hover:text-gold" data-testid="link-login-shop">
                {t('login.continue')}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
