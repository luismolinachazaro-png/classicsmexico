import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  CircleAlert,
  Clock3,
  Compass,
  Filter,
  Fuel,
  Gauge,
  Globe2,
  Menu,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import {
  getGetInventoryVehicleQueryKey,
  getGetSiteSummaryQueryKey,
  getListInventoryQueryKey,
  getListServicesQueryKey,
  getListSoldVehiclesQueryKey,
  useCreateInquiry,
  useGetInventoryVehicle,
  useGetSiteSummary,
  useListInventory,
  useListServices,
  useListSoldVehicles,
} from '@workspace/api-client-react';
import type {
  ImportService,
  SoldVehicle,
  Vehicle,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';

const queryClient = new QueryClient();
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const miles = new Intl.NumberFormat('en-US');

function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const links = [
    { href: '/inventory', label: 'Disponibles' },
    { href: '/sold', label: 'Vendidos' },
    { href: '/transport', label: 'Traslado' },
    { href: '/importacion', label: 'Importación' },
  ];
  return (
    <div className="site-grain min-h-[100dvh] bg-background text-foreground">
      <header className="relative z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" data-testid="link-home" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border border-primary bg-primary text-background">
              <span className="display-serif text-2xl italic">C</span>
            </span>
            <span className="leading-none">
              <span className="block font-semibold tracking-[.12em] text-foreground">CLASSICS MEXICO</span>
              <span className="label-mono mt-1 block text-muted-foreground">México · Estados Unidos · Europa</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`link-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}
                className={`ink-link text-sm ${location === link.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
            <InquiryDialog triggerLabel="Platica con nosotros" />
          </nav>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="border border-border p-2 text-foreground md:hidden"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            data-testid="button-toggle-menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-card px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-4" aria-label="Navegación móvil">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase().replaceAll(' ', '-')}`}
                  className="text-lg text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <InquiryDialog triggerLabel="Platica con nosotros" fullWidth />
            </nav>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.2fr_.8fr_.8fr] lg:px-12">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-primary bg-primary text-background display-serif text-xl italic">C</span>
              <span className="font-semibold tracking-[.12em]">CLASSICS MEXICO</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-secondary-foreground/65">
              Autos clásicos bien elegidos, procesos claros y atención personal en cada kilómetro.
            </p>
          </div>
          <div>
            <p className="label-mono text-accent">Conoce más</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-secondary-foreground/75">
              <Link href="/inventory" data-testid="link-footer-available" className="hover:text-accent">Autos disponibles</Link>
              <Link href="/sold" data-testid="link-footer-archive" className="hover:text-accent">Autos vendidos</Link>
              <Link href="/transport" data-testid="link-footer-transport" className="hover:text-accent">Traslado nacional</Link>
              <Link href="/importacion" data-testid="link-footer-import" className="hover:text-accent">Importación de autos</Link>
            </div>
          </div>
          <div>
            <p className="label-mono text-accent">Cobertura</p>
            <p className="mt-4 text-sm leading-7 text-secondary-foreground/75">Atención en México<br />Ciudad de México · Monterrey · Guadalajara</p>
            <p className="mt-4 font-mono text-xs text-secondary-foreground/50">LUN—VIE / 09:00—18:00 CST</p>
          </div>
        </div>
        <div className="border-t border-secondary-foreground/15 px-5 py-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 text-[11px] text-secondary-foreground/45 sm:flex-row">
            <span>© 2026 Classics Mexico. Autos clásicos.</span>
            <span>Información clara en cada paso.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoadingState({ label = 'Consultando el inventario…' }: { label?: string }) {
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12" data-testid="status-loading">
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-32 bg-muted" />
        <div className="h-12 w-2/3 bg-muted" />
        <div className="h-5 w-1/2 bg-muted" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-72 bg-muted" />)}
        </div>
      </div>
      <p className="label-mono mt-6 text-muted-foreground">{label}</p>
    </div>
  );
}

function ErrorState({ onRetry, label = 'No pudimos cargar esta página.' }: { onRetry?: () => void; label?: string }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-28 text-center" data-testid="status-error">
      <CircleAlert className="text-primary" size={26} />
      <h2 className="display-serif mt-5 text-3xl">Un momento, por favor.</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{label} Puedes intentarlo de nuevo.</p>
      {onRetry && <button onClick={onRetry} type="button" data-testid="button-retry" className="mt-6 border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">Intentar de nuevo</button>}
    </div>
  );
}

function ImageFrame({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className={`flex items-center justify-center bg-secondary text-secondary-foreground ${className}`} data-testid="image-fallback">
      <span className="display-serif text-3xl italic opacity-50">CM</span>
    </div>
  ) : (
    <img src={src} alt={alt} onError={() => setFailed(true)} className={`object-cover ${className}`} />
  );
}

function VehicleCard({ vehicle, compact = false }: { vehicle: Vehicle; compact?: boolean }) {
  return (
    <Link
      href={`/inventory/${vehicle.slug}`}
      data-testid={`card-vehicle-${vehicle.id}`}
      className={`vehicle-card group block ${compact ? '' : 'border border-border bg-card'}`}
    >
      <div className={`relative overflow-hidden bg-secondary ${compact ? 'aspect-[4/3]' : 'aspect-[4/3]'}`}>
        <ImageFrame src={vehicle.imageUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="h-full w-full" />
        {vehicle.featured && <span className="absolute left-3 top-3 bg-accent px-2 py-1 label-mono text-accent-foreground">Destacado</span>}
        <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/90 px-2 py-1 text-xs text-foreground"><MapPin size={12} />{vehicle.location}</span>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label-mono text-primary">{vehicle.year} · {vehicle.bodyStyle}</p>
            <h3 className="display-serif mt-2 text-xl text-foreground group-hover:text-primary sm:text-2xl">{vehicle.make} {vehicle.model}</h3>
          </div>
          <ArrowUpRight className="mt-1 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" size={18} />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="font-mono text-xs text-muted-foreground">{miles.format(vehicle.mileage)} MI</span>
          <span className="font-semibold text-primary">{money.format(vehicle.price)} USD</span>
        </div>
      </div>
    </Link>
  );
}

function SoldCard({ vehicle }: { vehicle: SoldVehicle }) {
  return (
    <article className="group border border-border bg-card" data-testid={`card-sold-${vehicle.id}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <ImageFrame src={vehicle.imageUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="h-full w-full grayscale transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 bg-secondary px-2 py-1 label-mono text-secondary-foreground">Vendido</span>
      </div>
      <div className="p-4">
        <p className="label-mono text-muted-foreground">{vehicle.year} · {vehicle.location}</p>
        <h3 className="display-serif mt-2 text-xl">{vehicle.make} {vehicle.model}</h3>
        <p className="mt-4 text-xs text-muted-foreground">Vendido en {new Date(vehicle.soldDate).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}</p>
      </div>
    </article>
  );
}

type InquiryKind = 'vehicle' | 'transport' | 'import' | 'general';

function InquiryDialog({ triggerLabel, vehicleSlug, inquiryType = 'general', fullWidth = false }: { triggerLabel: string; vehicleSlug?: string; inquiryType?: InquiryKind; fullWidth?: boolean }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const createInquiry = useCreateInquiry();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const apiInquiryType = inquiryType === 'import' ? 'general' : inquiryType;
    createInquiry.mutate({ data: { ...form, phone: form.phone || null, vehicleSlug: vehicleSlug || null, inquiryType: apiInquiryType } }, { onSuccess: () => setSubmitted(true) });
  };
  const close = () => { setOpen(false); setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }); };
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-testid={`button-inquiry-${inquiryType}`} className={`${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90`}>
        {triggerLabel}<ArrowRight size={16} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-secondary/70 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Iniciar conversación" data-testid="dialog-inquiry">
          <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto border border-border bg-card p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div><p className="label-mono text-primary">Atención personalizada</p><h2 className="display-serif mt-2 text-3xl">Cuéntanos qué necesitas.</h2></div>
              <button type="button" onClick={close} aria-label="Cerrar formulario de contacto" data-testid="button-close-inquiry" className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            {submitted ? (
              <div className="py-12 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><Check size={23} /></span>
                <h3 className="display-serif mt-5 text-2xl">Mensaje recibido.</h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Te contactaremos pronto para entender lo que necesitas y explicarte el siguiente paso.</p>
                <button type="button" onClick={close} data-testid="button-finish-inquiry" className="mt-7 border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">Cerrar</button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-7 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium">Nombre<input required minLength={2} value={form.name} onChange={(e) => update('name', e.target.value)} data-testid="input-inquiry-name" className="mt-2 w-full border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" /></label>
                  <label className="text-sm font-medium">Correo electrónico<input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} data-testid="input-inquiry-email" className="mt-2 w-full border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" /></label>
                </div>
                <label className="block text-sm font-medium">Teléfono <span className="font-normal text-muted-foreground">(opcional)</span><input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} data-testid="input-inquiry-phone" className="mt-2 w-full border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" /></label>
                <label className="block text-sm font-medium">¿Cómo podemos ayudarte?<textarea required minLength={10} rows={4} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder={inquiryType === 'transport' ? 'Indícanos dónde está el auto y a qué ciudad debe llegar.' : inquiryType === 'import' ? 'Cuéntanos qué auto buscas, tu presupuesto y si ya encontraste alguna opción.' : 'Cuéntanos qué auto buscas o qué necesitas resolver.'} data-testid="input-inquiry-message" className="mt-2 w-full resize-none border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" /></label>
                {createInquiry.isError && <p className="text-sm text-destructive" data-testid="status-inquiry-error">No pudimos enviar el mensaje. Inténtalo de nuevo.</p>}
                <button disabled={createInquiry.isPending} type="submit" data-testid="button-submit-inquiry" className="inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{createInquiry.isPending ? 'Enviando…' : 'Enviar mensaje'}<ArrowRight size={16} /></button>
                <p className="text-center text-[11px] leading-5 text-muted-foreground">Sin listas de correo. Solo una respuesta personal de nuestro equipo.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Home() {
  const inventory = useListInventory({ sort: 'featured' }, { query: { queryKey: getListInventoryQueryKey({ sort: 'featured' }) } });
  const sold = useListSoldVehicles(undefined, { query: { queryKey: getListSoldVehiclesQueryKey() } });
  const summary = useGetSiteSummary({ query: { queryKey: getGetSiteSummaryQueryKey() } });
  const featured = useMemo(() => (inventory.data ?? []).slice(0, 3), [inventory.data]);
  const soldItems = useMemo(() => (sold.data ?? []).slice(0, 3), [sold.data]);
  if (inventory.isLoading || sold.isLoading || summary.isLoading) return <LoadingState />;
  if (inventory.isError || sold.isError || summary.isError) return <ErrorState onRetry={() => { void inventory.refetch(); void sold.refetch(); void summary.refetch(); }} />;
  return (
    <div className="page-enter">
      <section className="relative min-h-[680px] overflow-hidden bg-secondary text-white">
        <img src={`${import.meta.env.BASE_URL}images/porsche-hero.jpg`} alt="Porsche clásico recorriendo una carretera" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-secondary/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-transparent to-transparent" />
        <div className="relative mx-auto flex min-h-[680px] max-w-[1440px] flex-col justify-end px-5 pb-14 pt-28 sm:px-8 lg:px-12 lg:pb-20">
          <div className="max-w-3xl">
            <p className="label-mono rise-in text-accent">Classics Mexico · Autos con historia</p>
            <h1 className="display-serif rise-in delay-1 mt-6 text-[clamp(3.7rem,8vw,7.8rem)] leading-[.9] tracking-[-.05em]">El clásico que<br /><span className="italic text-accent">sí quieres manejar.</span></h1>
            <p className="rise-in delay-2 mt-8 max-w-xl text-base leading-7 text-white/75 sm:text-lg">Encontramos, importamos y entregamos autos especiales. Sin promesas vagas: sabes qué estás comprando y qué hace falta para tenerlo en México.</p>
            <div className="rise-in delay-3 mt-9 flex flex-wrap items-center gap-4">
              <Link href="/inventory" data-testid="link-hero-inventory" className="inline-flex items-center gap-2 bg-accent px-5 py-3.5 text-sm font-semibold text-accent-foreground hover:-translate-y-0.5">Ver autos disponibles <ArrowRight size={16} /></Link>
              <Link href="/importacion" data-testid="link-hero-import" className="inline-flex items-center gap-2 border border-white/50 px-5 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-secondary">Quiero importar un auto <ArrowUpRight size={16} /></Link>
            </div>
          </div>
          <div className="mt-12 flex max-w-xl gap-10 border-t border-white/25 pt-5">
            <div><span className="block font-mono text-2xl text-accent">{summary.data?.yearsExperience ?? '—'}</span><span className="mt-1 block text-xs text-white/60">años haciendo esto</span></div>
            <div><span className="block font-mono text-2xl text-accent">{summary.data?.statesCovered ?? '—'}</span><span className="mt-1 block text-xs text-white/60">estados con cobertura</span></div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><p className="label-mono text-primary">En nuestro inventario</p><h2 className="display-serif mt-3 text-4xl tracking-tight sm:text-5xl">Autos seleccionados</h2></div>
          <Link href="/inventory" data-testid="link-home-all-inventory" className="ink-link inline-flex items-center gap-2 self-start text-sm font-semibold text-primary sm:self-auto">Ver todos los autos <ArrowUpRight size={16} /></Link>
        </div>
        {featured.length === 0 ? <EmptyState label="Pronto agregaremos nuevos autos al inventario." /> : <div className="mt-10 grid gap-6 md:grid-cols-3">{featured.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>}
      </section>
      <section className="border-y border-border bg-muted/45">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[.85fr_1.15fr] md:items-center lg:px-12 lg:py-24">
          <div><p className="label-mono text-primary">Por qué Classics Mexico</p><h2 className="display-serif mt-4 max-w-md text-4xl leading-tight sm:text-5xl">Comprar un auto clásico, sin incertidumbre.</h2><p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">Revisamos cada auto, documentamos su historia y confirmamos su situación legal en México. Queremos que una compra emocionante también sea una compra clara.</p></div>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
              {[
              { icon: ShieldCheck, title: 'Legalidad primero', text: 'Revisamos propiedad, condición y documentación antes de que un auto llegue a nuestro inventario.' },
              { icon: Compass, title: 'Una mirada experta', text: 'Sin subastas anónimas ni historias incompletas. Sabemos por qué cada auto es especial.' },
              { icon: Truck, title: 'Traslado en México', text: 'Coordinamos grúa, transporte nacional y cada entrega para que el auto llegue seguro a tu ciudad.' },
              { icon: MessageCircle, title: 'Respuestas directas', text: 'Pregunta lo que necesites. Nuestra recomendación es clara, específica y honesta.' },
            ].map(({ icon: Icon, title, text }) => <div key={title} className="bg-card p-6 sm:p-7"><Icon size={20} className="text-primary" /><h3 className="mt-8 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="label-mono text-primary">Entregados con cuidado</p><h2 className="display-serif mt-3 text-4xl sm:text-5xl">Entregas recientes</h2></div><Link href="/sold" data-testid="link-home-sold" className="ink-link inline-flex items-center gap-2 text-sm font-semibold text-primary">Ver autos vendidos <ArrowUpRight size={16} /></Link></div>
        {soldItems.length === 0 ? <EmptyState label="Estamos actualizando nuestro archivo." /> : <div className="mt-10 grid gap-6 md:grid-cols-3">{soldItems.map((vehicle) => <SoldCard key={vehicle.id} vehicle={vehicle} />)}</div>}
      </section>
      <section className="bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <p className="label-mono text-accent">Dos servicios, dos necesidades distintas</p>
          <div className="mt-8 grid gap-px bg-white/15 md:grid-cols-2">
            <div className="bg-secondary p-7 sm:p-10"><Truck size={24} className="text-accent" /><p className="label-mono mt-8 text-accent">Traslado nacional</p><h2 className="display-serif mt-3 text-4xl">Tu auto, de una ciudad a otra.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-white/65">Para cualquier auto que necesites mover dentro de México. Coordinamos recolección, transporte y entrega.</p><Link href="/transport" data-testid="link-home-transport" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent">Conocer traslado <ArrowRight size={16} /></Link></div>
            <div className="bg-secondary p-7 sm:p-10"><Globe2 size={24} className="text-accent" /><p className="label-mono mt-8 text-accent">Importación</p><h2 className="display-serif mt-3 text-4xl">Lo encontramos. Lo traemos.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-white/65">Buscamos el auto, revisamos su condición y nos encargamos del proceso para ponerlo en México.</p><Link href="/importacion" data-testid="link-home-import" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent">Conocer importación <ArrowRight size={16} /></Link></div>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="border border-dashed border-border px-6 py-16 text-center" data-testid="status-empty"><Sparkles className="mx-auto text-primary" size={22} /><p className="mt-4 text-sm text-muted-foreground">{label}</p></div>;
}

function Inventory() {
  const [search, setSearch] = useState('');
  const [bodyStyle, setBodyStyle] = useState('');
  const [sort, setSort] = useState<'featured' | 'newest' | 'price-low' | 'price-high'>('featured');
  const params = useMemo(() => ({ ...(search ? { search } : {}), ...(bodyStyle ? { bodyStyle } : {}), sort }), [search, bodyStyle, sort]);
  const query = useListInventory(params, { query: { queryKey: getListInventoryQueryKey(params) } });
  const bodyStyles = useMemo(() => Array.from(new Set((query.data ?? []).map((vehicle) => vehicle.bodyStyle))).sort(), [query.data]);
  return (
    <div className="page-enter">
      <section className="border-b border-border bg-muted/35">
        <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-24"><p className="label-mono text-primary">Inventario actual</p><div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h1 className="display-serif text-5xl tracking-tight sm:text-7xl">Autos disponibles</h1><p className="max-w-sm text-sm leading-6 text-muted-foreground">Modelos especiales, información clara y un proceso definido para llevarlos a México.</p></div></div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="flex flex-col gap-3 border border-border bg-card p-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Busca marca, modelo o una característica…" aria-label="Buscar inventario" data-testid="input-inventory-search" className="w-full bg-transparent py-3 pl-10 pr-3 text-sm outline-none" /></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 border border-border px-3 text-sm"><Filter size={15} className="text-primary" /><select value={bodyStyle} onChange={(e) => setBodyStyle(e.target.value)} aria-label="Filtrar por tipo de carrocería" data-testid="select-inventory-body-style" className="bg-transparent py-3 outline-none"><option value="">Todas las carrocerías</option>{bodyStyles.map((style) => <option key={style} value={style}>{style}</option>)}</select></label>
            <label className="flex items-center gap-2 border border-border px-3 text-sm"><span className="text-muted-foreground">Ordenar</span><select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Ordenar inventario" data-testid="select-inventory-sort" className="bg-transparent py-3 outline-none"><option value="featured">Destacados primero</option><option value="newest">Más recientes</option><option value="price-low">Precio: menor a mayor</option><option value="price-high">Precio: mayor a menor</option></select></label>
          </div>
        </div>
        {query.isLoading ? <LoadingState label="Revisando los autos disponibles…" /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : (query.data?.length ?? 0) === 0 ? <EmptyState label="No encontramos autos con esa búsqueda. Prueba con algo más general." /> : <><div className="mt-8 flex items-center justify-between"><p className="label-mono text-muted-foreground" data-testid="text-inventory-count">{query.data?.length} autos en el inventario</p>{(search || bodyStyle) && <button type="button" onClick={() => { setSearch(''); setBodyStyle(''); }} data-testid="button-clear-filters" className="text-xs font-semibold text-primary hover:underline">Limpiar filtros</button>}</div><div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{query.data?.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div></>}
      </section>
    </div>
  );
}

function InventoryDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const query = useGetInventoryVehicle(slug, { query: { queryKey: getGetInventoryVehicleQueryKey(slug) } });
  if (query.isLoading) return <LoadingState label="Abriendo el expediente del auto…" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} label="No pudimos encontrar este auto." />;
  const vehicle = query.data;
  return (
    <div className="page-enter">
      <div className="mx-auto max-w-[1440px] px-5 pt-8 sm:px-8 lg:px-12"><Link href="/inventory" data-testid="link-back-inventory" className="ink-link inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ChevronLeft size={16} /> Volver a autos disponibles</Link></div>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.16fr_.84fr] lg:gap-16 lg:px-12 lg:py-14">
        <div><div className="relative aspect-[4/3] overflow-hidden bg-secondary"><ImageFrame src={vehicle.imageUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="h-full w-full" /><span className="absolute left-4 top-4 bg-accent px-3 py-2 label-mono text-accent-foreground">Disponible</span></div><div className="mt-8 border-t border-border pt-7"><p className="label-mono text-primary">La historia</p><p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">{vehicle.description}</p></div></div>
        <div className="lg:pt-4"><p className="label-mono text-primary">{vehicle.year} · {vehicle.bodyStyle} · {vehicle.location}</p><h1 className="display-serif mt-4 text-5xl leading-[1.02] tracking-tight sm:text-6xl">{vehicle.make}<br /><span className="italic">{vehicle.model}</span></h1><p className="mt-6 font-mono text-2xl text-primary">{money.format(vehicle.price)} USD</p><p className="mt-2 text-sm text-muted-foreground">Antes de traslado, impuestos y registro.</p><div className="mt-9 grid grid-cols-2 border-y border-border py-5"><DetailStat icon={Gauge} label="Kilometraje" value={`${miles.format(vehicle.mileage)} mi`} /><DetailStat icon={Fuel} label="Motor" value={vehicle.engine} /><DetailStat icon={Clock3} label="Transmisión" value={vehicle.transmission} /><DetailStat icon={MapPin} label="Ubicación" value={vehicle.location} /></div><div className="mt-8"><InquiryDialog triggerLabel="Preguntar por este auto" vehicleSlug={vehicle.slug} inquiryType="vehicle" fullWidth /><p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={14} className="text-primary" /> Te enviaremos el expediente completo y los siguientes pasos.</p></div></div>
      </section>
      <section className="border-t border-border bg-muted/35"><div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-14 sm:px-8 md:grid-cols-3 lg:px-12"><div><p className="label-mono text-primary">¿Necesitas el traslado?</p><h2 className="display-serif mt-2 text-3xl">Lo llevamos hasta tu ciudad.</h2></div><div className="md:col-span-2 grid gap-6 sm:grid-cols-3">{['Revisamos y documentamos', 'Importamos y legalizamos', 'Entregamos en México'].map((item, index) => <div key={item} className="flex gap-3"><span className="font-mono text-xs text-primary">0{index + 1}</span><p className="text-sm leading-6">{item}</p></div>)}</div></div></section>
    </div>
  );
}

function DetailStat({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return <div className="flex gap-3 py-3"><Icon size={16} className="mt-0.5 shrink-0 text-primary" /><div><p className="label-mono text-muted-foreground">{label}</p><p className="mt-1 text-sm">{value}</p></div></div>;
}

function SoldArchive() {
  const query = useListSoldVehicles(undefined, { query: { queryKey: getListSoldVehiclesQueryKey() } });
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => (query.data ?? []).filter((vehicle) => `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.location}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  return <div className="page-enter"><section className="border-b border-border bg-secondary text-secondary-foreground"><div className="mx-auto max-w-[1440px] px-5 pb-14 pt-20 sm:px-8 lg:px-12 lg:pb-20 lg:pt-28"><p className="label-mono text-accent">Autos vendidos</p><h1 className="display-serif mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">Clásicos que ya tienen<br /><span className="italic text-accent">un nuevo dueño.</span></h1><p className="mt-7 max-w-lg text-base leading-7 text-secondary-foreground/70">Una selección de autos que hemos ayudado a comprar, importar y entregar en México.</p></div></section><section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : <><div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center"><p className="label-mono text-muted-foreground" data-testid="text-sold-count">{filtered.length} autos vendidos</p><div className="relative w-full sm:w-72"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por marca, modelo o ciudad" aria-label="Buscar autos vendidos" data-testid="input-sold-search" className="w-full border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" /></div></div>{filtered.length === 0 ? <EmptyState label="No encontramos autos con esa búsqueda." /> : <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((vehicle) => <SoldCard key={vehicle.id} vehicle={vehicle} />)}</div>}</>}</section></div>;
}

function Transport() {
  const services = useListServices({ query: { queryKey: getListServicesQueryKey() } });
  const transportService = ((services.data ?? []) as ImportService[]).filter((service) => service.id === 2);
  return <div className="page-enter"><section className="bg-primary text-primary-foreground"><div className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 pt-20 sm:px-8 md:grid-cols-[1.1fr_.9fr] md:items-end lg:px-12 lg:pb-24 lg:pt-28"><div><p className="label-mono text-accent">Traslado nacional</p><h1 className="display-serif mt-5 max-w-3xl text-5xl leading-[1.04] sm:text-7xl">Movemos tu auto<br /><span className="italic text-accent">dentro de México.</span></h1></div><p className="max-w-sm text-sm leading-7 text-primary-foreground/75">No importa si es clásico, nuevo o de uso diario. Coordinamos su recolección, traslado y entrega entre ciudades mexicanas.</p></div></section><section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="grid gap-10 md:grid-cols-[.7fr_1.3fr]"><div><p className="label-mono text-primary">De puerta a puerta</p><h2 className="display-serif mt-3 max-w-sm text-4xl">Tú nos dices dónde está y a dónde va.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">Con esa información definimos la ruta, el tipo de transporte y una fecha estimada de entrega.</p><div className="mt-8"><InquiryDialog triggerLabel="Cotizar un traslado" inquiryType="transport" /></div></div>{services.isLoading ? <div className="animate-pulse space-y-3"><div className="h-28 bg-muted" /></div> : services.isError ? <ErrorState onRetry={() => void services.refetch()} /> : transportService.length === 0 ? <EmptyState label="Podemos preparar una ruta a la medida." /> : <div className="grid gap-4">{transportService.map((service, index) => <ServiceRow key={service.id} service={service} index={index} />)}</div>}</div></section><section className="border-y border-border bg-muted/35"><div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20"><p className="label-mono text-primary">Así funciona</p><div className="mt-10 grid gap-0 md:grid-cols-4">{[{icon: MapPin, title: '01 / Ubicación', text: 'Nos compartes dónde está el auto y cuál es su destino.'}, {icon: PackageCheck, title: '02 / Cotización', text: 'Definimos la ruta, el tipo de transporte y el costo.'}, {icon: Truck, title: '03 / Recolección', text: 'Recogemos el auto y te mantenemos al tanto del recorrido.'}, {icon: Check, title: '04 / Entrega', text: 'Entregamos en la ciudad acordada y confirmamos la recepción.'}].map(({ icon: Icon, title, text }, index) => <div key={title} className={`border-l border-border px-5 py-2 first:border-l-0 md:px-6 ${index === 0 ? 'pl-0' : ''}`}><Icon size={19} className="text-primary" /><h3 className="mt-7 font-mono text-xs text-primary">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></div></section></div>;
}

function Importation() {
  const services = useListServices({ query: { queryKey: getListServicesQueryKey() } });
  const importServices = ((services.data ?? []) as ImportService[]).filter((service) => service.id !== 2);
  return <div className="page-enter"><section className="relative overflow-hidden bg-secondary text-secondary-foreground"><div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(135deg,transparent_0%,hsl(var(--accent)/.12)_100%)]" /><div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 pt-20 sm:px-8 md:grid-cols-[1.1fr_.9fr] md:items-end lg:px-12 lg:pb-24 lg:pt-28"><div><p className="label-mono text-accent">Importación de autos clásicos</p><h1 className="display-serif mt-5 max-w-3xl text-5xl leading-[1.04] sm:text-7xl">Del hallazgo<br /><span className="italic text-accent">a tus manos.</span></h1></div><p className="max-w-sm text-sm leading-7 text-secondary-foreground/70">Buscamos el auto en Estados Unidos o Europa, comprobamos que valga la pena y coordinamos el proceso para traerlo a México.</p></div></section><section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="grid gap-10 md:grid-cols-[.7fr_1.3fr]"><div><p className="label-mono text-primary">Nos encargamos del proceso</p><h2 className="display-serif mt-3 max-w-sm text-4xl">No necesitas convertirte en experto en importaciones.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">Puedes llegar con una idea o con un auto ya localizado. Revisamos cada caso antes de avanzar y te explicamos costos, tiempos y riesgos con claridad.</p><div className="mt-8"><InquiryDialog triggerLabel="Quiero importar un auto" inquiryType="import" /></div></div>{services.isLoading ? <div className="animate-pulse space-y-3"><div className="h-28 bg-muted" /><div className="h-28 bg-muted" /></div> : services.isError ? <ErrorState onRetry={() => void services.refetch()} /> : importServices.length === 0 ? <EmptyState label="Cuéntanos qué auto tienes en mente." /> : <div className="grid gap-4">{importServices.map((service, index) => <ServiceRow key={service.id} service={service} index={index} />)}</div>}</div></section></div>;
}

function ServiceRow({ service, index }: { service: ImportService; index: number }) {
  return <article className="border border-border bg-card p-6 sm:p-8"><div className="flex items-start gap-5"><span className="font-mono text-sm text-primary">0{index + 1}</span><div className="flex-1"><h3 className="display-serif text-2xl">{service.name}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{service.description}</p>{service.details.length > 0 && <ul className="mt-6 grid gap-3 sm:grid-cols-2">{service.details.map((detail) => <li key={detail} className="flex gap-2 text-sm"><Check size={15} className="mt-0.5 shrink-0 text-primary" />{detail}</li>)}</ul>}</div></div></article>;
}

function Seo() {
  const [location] = useLocation();
  useEffect(() => {
    const pages: Record<string, [string, string]> = {
      '/': ['Classics Mexico — Autos clásicos importados', 'Autos clásicos seleccionados en Estados Unidos y Europa, legalizados y entregados en México.'],
      '/inventory': ['Autos disponibles — Classics Mexico', 'Conoce autos clásicos importados, legalizados y disponibles para clientes en México.'],
      '/sold': ['Autos vendidos — Classics Mexico', 'Conoce algunos de los autos clásicos que hemos entregado en México.'],
      '/transport': ['Traslado de autos en México — Classics Mexico', 'Movemos cualquier auto entre ciudades de México con recolección, seguimiento y entrega coordinada.'],
      '/importacion': ['Importación de autos clásicos — Classics Mexico', 'Buscamos, revisamos e importamos autos clásicos desde Estados Unidos o Europa hasta México.'],
    };
    const [title, description] = pages[location] ?? ['Classics Mexico — Autos clásicos', 'Autos clásicos seleccionados, importados y legalizados para clientes en México.'];
    document.title = title;
    const meta = document.querySelector('meta[name="description"]') ?? document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', description);
    document.head.appendChild(meta);
  }, [location]);
  return null;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Seo /><Shell><Switch><Route path="/" component={Home} /><Route path="/inventory" component={Inventory} /><Route path="/inventory/:slug" component={InventoryDetail} /><Route path="/sold" component={SoldArchive} /><Route path="/transport" component={Transport} /><Route path="/importacion" component={Importation} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;