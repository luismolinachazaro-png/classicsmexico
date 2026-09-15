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
  getGetSoldVehicleQueryKey,
  getListServicesQueryKey,
  getListSoldVehiclesQueryKey,
  useCreateInquiry,
  useGetInventoryVehicle,
  useGetSoldVehicle,
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
const WHATSAPP_URL = 'https://wa.me/+15125664915';

function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const links = [
    { href: '/inventory', label: 'Venta' },
    { href: '/importacion', label: 'Importación' },
    { href: '/transport', label: 'Traslado' },
  ];
  return (
    <div className="site-grain min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background/92 backdrop-blur-md">
        <div className="mx-auto grid h-[82px] max-w-[1600px] grid-cols-[1fr_auto_auto] items-center px-5 sm:px-8 md:grid-cols-[auto_1fr_auto] lg:px-12">
          <Link href="/" data-testid="link-home" className="group flex items-center gap-3">
            <span className="display-serif text-[2rem] italic leading-none text-primary">CM</span>
            <span className="h-8 w-px bg-border" />
            <span className="leading-none">
              <span className="block text-[11px] font-bold tracking-[.2em] text-foreground">CLASSICS</span>
              <span className="mt-1 block text-[11px] font-bold tracking-[.2em] text-foreground">MÉXICO</span>
            </span>
          </Link>
          <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="Navegación principal">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`link-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-[.12em] ${location === link.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="link-header-contact"
            className="hidden items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[.12em] text-primary-foreground hover:bg-primary/90 md:inline-flex"
          >
            <MessageCircle size={15} />
            Contáctanos
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="link-mobile-contact"
            className="mr-4 inline-flex items-center gap-1.5 bg-primary px-3 py-2 text-[10px] font-semibold uppercase tracking-[.1em] text-primary-foreground md:hidden"
          >
            <MessageCircle size={14} />
            Contáctanos
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="border border-foreground/25 p-2 text-foreground md:hidden"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            data-testid="button-toggle-menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-background px-5 py-5 md:hidden">
            <nav className="flex flex-col" aria-label="Navegación móvil">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase().replaceAll(' ', '-')}`}
                  className="border-b border-border py-4 display-serif text-2xl text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="overflow-hidden bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-5 pb-10 pt-16 sm:px-8 lg:grid-cols-[1.35fr_.65fr_.65fr] lg:px-12 lg:pt-24">
          <div>
            <p className="label-mono text-accent">Autos que merecen otra vida</p>
            <p className="display-serif mt-5 max-w-xl text-4xl leading-tight sm:text-5xl">El siguiente clásico de México puede estar en cualquier parte del mundo.</p>
          </div>
          <div>
            <p className="label-mono text-accent">Tres verticales</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-secondary-foreground/75">
              <Link href="/inventory" data-testid="link-footer-available" className="hover:text-accent">Venta de clásicos</Link>
              <Link href="/importacion" data-testid="link-footer-import" className="hover:text-accent">Importación</Link>
              <Link href="/transport" data-testid="link-footer-transport" className="hover:text-accent">Traslado nacional</Link>
              <Link href="/inventory#sold-archive" data-testid="link-footer-archive" className="text-secondary-foreground/45 hover:text-accent">Archivo de vendidos</Link>
            </div>
          </div>
          <div>
            <p className="label-mono text-accent">Cobertura</p>
            <p className="mt-4 text-sm leading-7 text-secondary-foreground/75">Atención en México<br />Ciudad de México · Monterrey · Guadalajara</p>
            <p className="mt-4 font-mono text-xs text-secondary-foreground/50">LUN—VIE / 09:00—18:00 CST</p>
          </div>
        </div>
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <p aria-hidden="true" className="pointer-events-none select-none whitespace-nowrap text-center text-[clamp(4rem,13vw,12rem)] font-bold leading-[.8] tracking-[-.075em] text-secondary-foreground/[.055]">CLASSICS MÉXICO</p>
        </div>
        <div className="border-t border-secondary-foreground/15 px-5 py-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-2 text-[11px] text-secondary-foreground/45 sm:flex-row">
            <span>© 2026 Classics México. Autos clásicos.</span>
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

function ImageFrame({ src, alt, className = '', fit = 'cover' }: { src: string; alt: string; className?: string; fit?: 'cover' | 'contain' }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className={`flex items-center justify-center bg-secondary text-secondary-foreground ${className}`} data-testid="image-fallback">
      <span className="display-serif text-3xl italic opacity-50">CM</span>
    </div>
  ) : (
    <img src={src} alt={alt} onError={() => setFailed(true)} className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`} />
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
  const usesPortraitTemplate = [
    'porsche-911-coupe-1975',
    'porsche-911-sc-targa-1978',
    'bmw-m3-e46-2003',
  ].some((assetName) => vehicle.imageUrl.includes(assetName));
  return (
    <Link href={`/sold/${vehicle.id}`} className="group block border border-border bg-card text-card-foreground transition hover:-translate-y-1 hover:shadow-xl" data-testid={`card-sold-${vehicle.id}`}>
      <div className={`relative overflow-hidden bg-secondary ${usesPortraitTemplate ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <ImageFrame src={vehicle.imageUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 bg-secondary px-2 py-1 label-mono text-secondary-foreground">Vendido</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4"><h3 className="display-serif text-xl">{vehicle.make} {vehicle.model} {vehicle.year}</h3><ArrowUpRight size={17} className="mt-1 shrink-0 text-primary transition group-hover:rotate-45" /></div>
        {vehicle.description && !usesPortraitTemplate && <p className="mt-3 text-sm leading-6 text-muted-foreground">{vehicle.description}</p>}
      </div>
    </Link>
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
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" data-testid={`button-inquiry-${inquiryType}`} className={`${fullWidth ? 'w-full' : ''} inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90`}>
        Contáctanos<ArrowUpRight size={16} />
      </a>
      {open && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-secondary/70 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-label="Iniciar conversación" data-testid="dialog-inquiry">
          <div className="mx-auto my-1 max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto overscroll-contain border border-border bg-card p-6 shadow-2xl sm:my-0 sm:max-h-[calc(100dvh-2.5rem)] sm:p-8">
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

function HomeSoldCard({ vehicle, lead = false }: { vehicle: SoldVehicle; lead?: boolean }) {
  return (
    <article className={`group grid overflow-hidden border border-white/15 ${lead ? 'md:grid-cols-[1.25fr_.75fr]' : ''}`} data-testid={`card-home-sold-${vehicle.id}`}>
      <div className={`relative overflow-hidden bg-primary ${lead ? 'min-h-[390px]' : 'aspect-[4/3]'}`}>
        <ImageFrame src={vehicle.imageUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="h-full w-full grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        <span className="absolute left-4 top-4 bg-accent px-3 py-2 label-mono text-accent-foreground">Entregado</span>
      </div>
      <div className={`flex flex-col justify-between bg-secondary p-6 text-secondary-foreground ${lead ? 'sm:p-8' : ''}`}>
        <p className="label-mono text-accent">{vehicle.year}</p>
        <div className={lead ? 'mt-20' : 'mt-12'}>
          <h3 className={`display-serif ${lead ? 'text-4xl' : 'text-3xl'}`}>{vehicle.make}<br /><span className="italic">{vehicle.model}</span></h3>
          {vehicle.mileageKm != null && <p className="mt-4 font-mono text-xs text-white/65">{miles.format(vehicle.mileageKm)} KM</p>}
          <p className="mt-5 border-t border-white/15 pt-4 text-xs text-white/50">Vendido en {new Date(vehicle.soldDate).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </article>
  );
}

function Home() {
  return (
    <div className="page-enter overflow-hidden">
      <section className="bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-[1600px] lg:min-h-[690px] lg:grid-cols-[.9fr_1.1fr]">
          <div className="flex items-center px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
            <h1 className="display-serif text-[clamp(3.8rem,7.5vw,8rem)] leading-[.86] tracking-[-.065em]">Tres formas<br />de vivir un<br /><span className="italic text-accent">gran auto.</span></h1>
          </div>
          <div className="relative min-h-[430px] overflow-hidden">
            <img src={`${import.meta.env.BASE_URL}images/porsche-hero.jpg`} alt="Auto clásico en movimiento" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/55 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="editorial-grid mx-auto max-w-[1600px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="border-y border-border py-16 text-center">
          <p className="display-serif text-5xl italic text-primary sm:text-6xl">Más por venir.</p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted-foreground">Estamos preparando nuevas unidades para el próximo capítulo de Classics México.</p>
          <p className="mx-auto mt-8 max-w-md text-sm leading-7 text-muted-foreground">Mientras tanto, revisa algunos de los clásicos que ya encontraron dueño.</p>
          <Link href="/inventory" data-testid="link-home-sold-archive" className="mt-6 inline-flex items-center gap-3 bg-primary px-5 py-3.5 text-xs font-bold uppercase tracking-[.12em] text-primary-foreground hover:bg-primary/90">Ver autos vendidos <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12 lg:py-28">
          <div><p className="label-mono text-accent">Importación</p><h2 className="display-serif mt-5 max-w-lg text-5xl leading-[1] sm:text-6xl">El auto que buscas puede estar fuera de México.</h2><p className="mt-7 max-w-md text-sm leading-7 text-white/65">Nos encargamos de encontrarlo, revisarlo y traerlo legalmente desde Estados Unidos o Europa.</p><Link href="/importacion" data-testid="link-home-import" className="mt-8 inline-flex items-center gap-3 bg-accent px-5 py-4 text-xs font-bold uppercase tracking-[.12em] text-accent-foreground">Conocer importación <ArrowRight size={15} /></Link></div>
          <div className="grid border-t border-white/25 sm:grid-cols-2">
            {['Búsqueda y selección', 'Inspección del vehículo', 'Aduana y legalización', 'Entrega en México'].map((item, index) => <div key={item} className="border-b border-white/20 py-7 sm:px-6 sm:odd:border-r"><span className="font-mono text-xs text-accent">0{index + 1}</span><h3 className="display-serif mt-8 text-2xl">{item}</h3></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12 lg:py-28">
        <div><p className="label-mono text-primary">Traslado</p><h2 className="display-serif mt-5 max-w-lg text-5xl leading-[1] sm:text-6xl">De una ciudad a otra.</h2><p className="mt-7 max-w-md text-sm leading-7 text-muted-foreground">Este servicio no depende de una compra o importación. Movemos cualquier vehículo dentro de México.</p><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" data-testid="link-home-transport" className="mt-8 inline-flex items-center gap-3 bg-primary px-5 py-4 text-xs font-bold uppercase tracking-[.12em] text-primary-foreground">Contáctanos <ArrowUpRight size={15} /></a></div>
        <div className="relative min-h-[390px] overflow-hidden bg-secondary">
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(45deg,transparent_48%,hsl(var(--accent))_49%,hsl(var(--accent))_51%,transparent_52%)] [background-size:48px_48px]" />
          <div className="relative grid h-full content-between p-7 text-secondary-foreground sm:p-10">
            <div className="flex justify-between"><MapPin className="text-accent" /><span className="label-mono text-white/45">Cobertura nacional</span></div>
            <div><p className="display-serif max-w-xl text-4xl sm:text-5xl">Movemos tu auto donde lo necesitas.</p><p className="mt-5 max-w-lg text-sm leading-7 text-white/65">Definimos la ruta y el tipo de transporte adecuado para llevarlo con seguridad a cualquier estado de México.</p><div className="mt-7 flex flex-wrap gap-2">{['Cobertura nacional', 'Transporte abierto o cerrado', 'Atención personalizada'].map((item) => <span key={item} className="border border-white/25 px-3 py-2 text-xs text-white/70">{item}</span>)}</div></div>
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
  const sold = useListSoldVehicles(undefined, { query: { queryKey: getListSoldVehiclesQueryKey() } });
  const recentSold = useMemo(() => (sold.data ?? []).slice(0, 3), [sold.data]);
  return (
    <div className="page-enter">
      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="border-y border-border py-20 text-center">
          <p className="display-serif text-5xl italic text-primary sm:text-6xl">Más por venir.</p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted-foreground">Estamos preparando nuevas unidades para el próximo capítulo de Classics México.</p>
        </div>
      </section>
      <section id="sold-archive" className="border-t border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="label-mono text-accent">Archivo de vendidos</p><h2 className="display-serif mt-4 text-4xl sm:text-5xl">Clásicos que ya encontraron dueño.</h2></div>
          </div>
          {sold.isLoading ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse bg-white/10" />)}</div> : sold.isError ? <p className="mt-8 text-sm text-secondary-foreground/60">El archivo está temporalmente fuera de servicio.</p> : recentSold.length === 0 ? <p className="mt-8 text-sm text-secondary-foreground/60">Pronto agregaremos autos a este archivo.</p> : <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{recentSold.map((vehicle) => <SoldCard key={vehicle.id} vehicle={vehicle} />)}</div>}
        </div>
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

function SoldDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id);
  const query = useGetSoldVehicle(vehicleId, {
    query: {
      queryKey: getGetSoldVehicleQueryKey(vehicleId),
      enabled: Number.isInteger(vehicleId) && vehicleId > 0,
    },
  });

  if (!Number.isInteger(vehicleId) || vehicleId <= 0) return <NotFound />;
  if (query.isLoading) return <LoadingState label="Abriendo la historia de este clásico…" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} label="No pudimos encontrar este auto vendido." />;

  const vehicle = query.data;

  return (
    <div className="page-enter">
      <section className="bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 lg:px-12 lg:pb-20">
          <Link href="/inventory#sold-archive" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-secondary-foreground/65 hover:text-accent"><ChevronLeft size={15} />Volver a autos vendidos</Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
            <div>
              <p className="label-mono text-accent">Vendido</p>
              <h1 className="display-serif mt-5 text-5xl leading-[.95] sm:text-7xl">{vehicle.make}<br /><span className="italic text-accent">{vehicle.model} {vehicle.year}</span></h1>
              {vehicle.mileageKm != null && <p className="mt-8 border-t border-white/15 pt-5 font-mono text-sm text-secondary-foreground/75">{miles.format(vehicle.mileageKm)} KM</p>}
              <p className="mt-8 text-base leading-8 text-secondary-foreground/75">{vehicle.description ?? `Un ${vehicle.make} ${vehicle.model} de ${vehicle.year} que ya forma parte de una nueva colección.`}</p>
            </div>
            <div className="overflow-hidden border border-white/15 bg-primary">
              <ImageFrame src={vehicle.imageUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="aspect-[3/4] h-full w-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SoldArchive() {
  const query = useListSoldVehicles(undefined, { query: { queryKey: getListSoldVehiclesQueryKey() } });
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => (query.data ?? []).filter((vehicle) => `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  return <div className="page-enter"><section className="border-b border-border bg-secondary text-secondary-foreground"><div className="mx-auto max-w-[1440px] px-5 pb-14 pt-20 sm:px-8 lg:px-12 lg:pb-20 lg:pt-28"><p className="label-mono text-accent">Autos vendidos</p><h1 className="display-serif mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">Clásicos que ya tienen<br /><span className="italic text-accent">un nuevo dueño.</span></h1><p className="mt-7 max-w-lg text-base leading-7 text-secondary-foreground/70">Una selección de autos que hemos ayudado a comprar, importar y entregar en México.</p></div></section><section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : <><div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center"><p className="label-mono text-muted-foreground" data-testid="text-sold-count">{filtered.length} autos vendidos</p><div className="relative w-full sm:w-72"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por marca o modelo" aria-label="Buscar autos vendidos" data-testid="input-sold-search" className="w-full border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" /></div></div>{filtered.length === 0 ? <EmptyState label="No encontramos autos con esa búsqueda." /> : <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((vehicle) => <SoldCard key={vehicle.id} vehicle={vehicle} />)}</div>}</>}</section></div>;
}

function Transport() {
  return (
    <div className="page-enter">
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-12 pt-14 sm:px-8 md:grid-cols-[1.1fr_.9fr] md:items-center lg:px-12 lg:pb-16 lg:pt-20">
          <div>
            <p className="label-mono text-accent">Traslado nacional</p>
            <h1 className="display-serif mt-5 max-w-3xl text-5xl leading-[1.04] sm:text-7xl">Movemos tu auto<br /><span className="italic text-accent">dentro de México.</span></h1>
          </div>
          <p className="max-w-sm text-sm leading-7 text-primary-foreground/75">No importa si es clásico, nuevo o de uso diario. Coordinamos su recolección, traslado y entrega entre ciudades mexicanas.</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="max-w-md">
          <div>
            <p className="label-mono text-primary">De puerta a puerta</p>
            <h2 className="display-serif mt-3 max-w-sm text-4xl">Tú nos dices dónde está y a dónde va.</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">Con esa información definimos la ruta, el tipo de transporte y una fecha estimada de entrega.</p>
            <div className="mt-8"><InquiryDialog triggerLabel="Cotizar un traslado" inquiryType="transport" /></div>
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-muted/35">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-18">
          <p className="label-mono text-primary">Así funciona</p>
          <div className="mt-8 grid gap-0 md:grid-cols-4">
            {[{ icon: MapPin, title: 'Ubicación', text: 'Nos compartes dónde está el auto y cuál es su destino.' }, { icon: PackageCheck, title: 'Cotización', text: 'Definimos la ruta, el tipo de transporte y el costo.' }, { icon: Truck, title: 'Recolección', text: 'Recogemos el auto y te mantenemos al tanto del recorrido.' }, { icon: Check, title: 'Entrega', text: 'Entregamos en la ciudad acordada y confirmamos la recepción.' }].map(({ icon: Icon, title, text }, index) => <div key={title} className={`border-l border-border px-5 py-2 first:border-l-0 md:px-6 ${index === 0 ? 'pl-0' : ''}`}><Icon size={19} className="text-primary" /><h3 className="mt-7 font-mono text-xs text-primary">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
          </div>
        </div>
      </section>
    </div>
  );
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
      '/': ['Classics México — Autos clásicos importados', 'Autos clásicos seleccionados en Estados Unidos y Europa, legalizados y entregados en México.'],
      '/inventory': ['Autos disponibles — Classics México', 'Conoce autos clásicos importados, legalizados y disponibles para clientes en México.'],
      '/transport': ['Traslado de autos en México — Classics México', 'Movemos cualquier auto entre ciudades de México con recolección, seguimiento y entrega coordinada.'],
      '/importacion': ['Importación de autos clásicos — Classics México', 'Buscamos, revisamos e importamos autos clásicos desde Estados Unidos o Europa hasta México.'],
    };
    const [title, description] = pages[location] ?? ['Classics México — Autos clásicos', 'Autos clásicos seleccionados, importados y legalizados para clientes en México.'];
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
  return <ErrorBoundary resetKey={location}><Seo /><Shell><Switch><Route path="/" component={Home} /><Route path="/inventory" component={Inventory} /><Route path="/inventory/:slug" component={InventoryDetail} /><Route path="/sold/:id" component={SoldDetail} /><Route path="/transport" component={Transport} /><Route path="/importacion" component={Importation} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;