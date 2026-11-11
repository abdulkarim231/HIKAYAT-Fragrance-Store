import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/application/locale-provider';
import type { MessageKey } from '@/i18n/messages';
import { btnPrimary } from '@/presentation/components/common/styles';

const schema = z.object({
  fullName: z.string().trim().min(2, 'checkout.err.name').max(120, 'checkout.err.name'),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,16}$/, 'checkout.err.phone'),
  email: z.string().trim().email('checkout.err.email').max(254, 'checkout.err.email'),
  city: z.string().trim().min(2, 'checkout.err.city').max(100, 'checkout.err.city'),
  address: z.string().trim().min(5, 'checkout.err.address').max(500, 'checkout.err.address'),
  notes: z.string().max(300).optional(),
});
export type DeliveryInfo = z.infer<typeof schema>;

const FIELDS: { name: Exclude<keyof DeliveryInfo, 'notes'>; label: MessageKey; type?: string; auto: string; span?: boolean }[] = [
  { name: 'fullName', label: 'checkout.fullName', auto: 'name', span: true },
  { name: 'phone', label: 'checkout.phone', type: 'tel', auto: 'tel' },
  { name: 'email', label: 'checkout.email', type: 'email', auto: 'email' },
  { name: 'city', label: 'checkout.city', auto: 'address-level2' },
  { name: 'address', label: 'checkout.address', auto: 'street-address' },
];

const inputCls = 'h-12 rounded-sm border-olive/20 bg-card focus-visible:ring-gold';

export function DeliveryForm({ defaultValues, onReview }: { defaultValues?: DeliveryInfo; onReview: (v: DeliveryInfo) => void }) {
  const { t } = useLocale();
  const form = useForm<DeliveryInfo>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { fullName: '', phone: '', email: '', city: '', address: '', notes: '' },
  });
  const msg = (m?: string) => (m ? t(m as MessageKey) : undefined);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onReview)} className="grid gap-5 sm:grid-cols-2" noValidate>
        {FIELDS.map((f) => (
          <FormField key={f.name} control={form.control} name={f.name} render={({ field, fieldState }) => (
            <FormItem className={f.span ? 'sm:col-span-2' : undefined}>
              <FormLabel className="text-xs uppercase tracking-[0.14em] text-olive rtl:tracking-normal">{t(f.label)}</FormLabel>
              <FormControl>
                <Input {...field} type={f.type ?? 'text'} autoComplete={f.auto} className={inputCls} data-testid={`input-${f.name}`} />
              </FormControl>
              {fieldState.error && <p role="alert" className="text-xs text-destructive" data-testid={`error-${f.name}`}>{msg(fieldState.error.message)}</p>}
            </FormItem>
          )} />
        ))}
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel className="text-xs uppercase tracking-[0.14em] text-olive rtl:tracking-normal">{t('checkout.notes')}</FormLabel>
            <FormControl><Textarea {...field} rows={3} className="rounded-sm border-olive/20 bg-card" data-testid="input-notes" /></FormControl>
          </FormItem>
        )} />
        <div className="sm:col-span-2">
          <button type="submit" className={`${btnPrimary} w-full sm:w-auto`} data-testid="button-review">{t('checkout.review')}</button>
        </div>
      </form>
    </Form>
  );
}
