import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
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
    { href: '/inventory', label: 'Available' },
    { href: '/sold', label: 'Archive' },
    { href: '/transport', label: 'Transport & import' },
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
              <span className="block font-semibold tracking-[.12em] text-foreground">CARRIL & CO.</span>
              <span className="label-mono mt-1 block text-muted-foreground">Est. 2009 · MX / USA</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
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
            <InquiryDialog triggerLabel="Start a conversation" />
          </nav>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="border border-border p-2 text-foreground md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            data-testid="button-toggle-menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-card px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-4" aria-label="Mobile">
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
              <InquiryDialog triggerLabel="Start a conversation" fullWidth />
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
              <span className="font-semibold tracking-[.12em]">CARRIL & CO.</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-secondary-foreground/65">
              Distinctive vintage motorcars, sourced with patience in the United States and delivered with clarity to Mexico.
            </p>
          </div>
          <div>
            <p className="label-mono text-accent">Explore</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-secondary-foreground/75">
              <Link href="/inventory" data-testid="link-footer-available" className="hover:text-accent">Available cars</Link>
              <Link href="/sold" data-testid="link-footer-archive" className="hover:text-accent">Recent placements</Link>
              <Link href="/transport" data-testid="link-footer-transport" className="hover:text-accent">Transport & import</Link>
            </div>
          </div>
          <div>
            <p className="label-mono text-accent">On the road</p>
            <p className="mt-4 text-sm leading-7 text-secondary-foreground/75">USA sourcing desk<br />Mexico City · Monterrey · Guadalajara</p>
            <p className="mt-4 font-mono text-xs text-secondary-foreground/50">MON—FRI / 09:00—18:00 CST</p>
          </div>
        </div>
        <div className="border-t border-secondary-foreground/15 px-5 py-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 text-[11px] text-secondary-foreground/45 sm:flex-row">
            <span>© 2025 Carril & Co. Classic imports.</span>
            <span>Provenance over polish.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoadingState({ label = 'Reading the ledger…' }: { label?: string }) {
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

function ErrorState({ onRetry, label = 'This page could not be loaded.' }: { onRetry?: () => void; label?: string }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-28 text-center" data-testid="status-error">
      <CircleAlert className="text-primary" size={26} />
      <h2 className="display-serif mt-5 text-3xl">A moment, please.</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{label} Our desk is still here.</p>
      {onRetry && <button onClick={onRetry} type="button" data-testid="button-retry" className="mt-6 border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">Try again</button>}
    </div>
  );
}

function ImageFrame({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className={`flex items-center justify-center bg-secondary text-secondary-foreground ${className}`} data-testid="image-fallback">
      <span className="display-serif text-3xl italic opacity-50">C&Co.</span>
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
        {vehicle.featured && <span className="absolute left-3 top-3 bg-accent px-2 py-1 label-mono text-accent-foreground">Selected</span>}
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
          <span className="font-semibold text-primary">{money.format(vehicle.price)}</span>
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
        <span className="absolute left-3 top-3 bg-secondary px-2 py-1 label-mono text-secondary-foreground">Placed</span>
      </div>
      <div className="p-4">
        <p className="label-mono text-muted-foreground">{vehicle.year} · {vehicle.location}</p>
        <h3 className="display-serif mt-2 text-xl">{vehicle.make} {vehicle.model}</h3>
        <p className="mt-4 text-xs text-muted-foreground">Placed {new Date(vehicle.soldDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
      </div>
    </article>
  );
}

function InquiryDialog({ triggerLabel, vehicleSlug, inquiryType = 'general', fullWidth = false }: { triggerLabel: string; vehicleSlug?: string; inquiryType?: 'vehicle' | 'transport' | 'general'; fullWidth?: boolean }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const createInquiry = useCreateInquiry();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createInquiry.mutate({ data: { ...form, phone: form.phone || null, vehicleSlug: vehicleSlug || null, inquiryType } }, { onSuccess: () => setSubmitted(true) });
  };
  const close = () => { setOpen(false); setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }); };
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-testid={`button-inquiry-${inquiryType}`} className={`${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90`}>
        {triggerLabel}<ArrowRight size={16} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-secondary/70 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Start a conversation" data-testid="dialog-inquiry">
          <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto border border-border bg-card p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div><p className="label-mono text-primary">Private client desk</p><h2 className="display-serif mt-2 text-3xl">Let’s talk cars.</h2></div>
              <button type="button" onClick={close} aria-label="Close inquiry form" data-testid="button-close-inquiry" className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            {submitted ? (
              <div className="py-12 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><Check size={23} /></span>
                <h3 className="display-serif mt-5 text-2xl">Message received.</h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">A member of our desk will be in touch shortly. We look forward to hearing what you are looking for.</p>
                <button type="button" onClick={close} data-testid="button-finish-inquiry" className="mt-7 border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">Close</button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-7 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium">Name<input required minLength={2} value={form.name} onChange={(e) => update('name', e.target.value)} data-testid="input-inquiry-name" className="mt-2 w-full border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" /></label>
                  <label className="text-sm font-medium">Email<input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} data-testid="input-inquiry-email" className="mt-2 w-full border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" /></label>
                </div>
                <label className="block text-sm font-medium">Phone <span className="font-normal text-muted-foreground">(optional)</span><input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} data-testid="input-inquiry-phone" className="mt-2 w-full border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" /></label>
                <label className="block text-sm font-medium">How can we help?<textarea required minLength={10} rows={4} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder={inquiryType === 'transport' ? 'Tell us where the car is and where it needs to go.' : 'Tell us a little about the car or journey you have in mind.'} data-testid="input-inquiry-message" className="mt-2 w-full resize-none border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" /></label>
                {createInquiry.isError && <p className="text-sm text-destructive" data-testid="status-inquiry-error">We could not send that just yet. Please try again.</p>}
                <button disabled={createInquiry.isPending} type="submit" data-testid="button-submit-inquiry" className="inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{createInquiry.isPending ? 'Sending…' : 'Send to the desk'}<ArrowRight size={16} /></button>
                <p className="text-center text-[11px] leading-5 text-muted-foreground">No mailing lists. Just a thoughtful reply from our team.</p>
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
      <section className="relative overflow-hidden bg-secondary text-secondary-foreground">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full border border-accent/30 sm:h-96 sm:w-96" />
        <div className="absolute right-8 top-28 h-52 w-52 rounded-full border border-accent/20 sm:right-24 sm:h-72 sm:w-72" />
        <div className="mx-auto grid min-h-[580px] max-w-[1440px] items-end gap-12 px-5 pb-14 pt-24 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-12 lg:pb-20 lg:pt-32">
          <div className="relative z-10 max-w-2xl">
            <p className="label-mono rise-in text-accent">Specialist classic imports · Mexico</p>
            <h1 className="display-serif rise-in delay-1 mt-6 text-[clamp(3.4rem,8vw,7.8rem)] leading-[.94] tracking-[-.05em]">Good cars<br /><span className="italic text-accent">carry stories.</span></h1>
            <p className="rise-in delay-2 mt-8 max-w-lg text-base leading-7 text-secondary-foreground/70 sm:text-lg">We find the ones worth bringing home. Distinctive vintage vehicles, sourced across the United States and guided safely to their next chapter in Mexico.</p>
            <div className="rise-in delay-3 mt-9 flex flex-wrap items-center gap-5">
              <Link href="/inventory" data-testid="link-hero-inventory" className="inline-flex items-center gap-2 bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5">View available cars <ArrowRight size={16} /></Link>
              <Link href="/transport" data-testid="link-hero-transport" className="ink-link text-sm text-secondary-foreground/80 hover:text-accent">How the journey works</Link>
            </div>
          </div>
          <div className="relative z-10 lg:pb-3">
            <div className="border-l border-accent/45 pl-5 sm:ml-auto sm:max-w-sm">
              <p className="label-mono text-accent">The short version</p>
              <p className="display-serif mt-4 text-2xl leading-snug">Not the biggest showroom. The most considered one.</p>
              <div className="mt-6 grid grid-cols-2 gap-5 border-t border-secondary-foreground/20 pt-5">
                <div><span className="block font-mono text-2xl text-accent">{summary.data?.yearsExperience ?? '—'}</span><span className="mt-1 block text-xs text-secondary-foreground/55">years at it</span></div>
                <div><span className="block font-mono text-2xl text-accent">{summary.data?.statesCovered ?? '—'}</span><span className="mt-1 block text-xs text-secondary-foreground/55">US states covered</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><p className="label-mono text-primary">On the desk now</p><h2 className="display-serif mt-3 text-4xl tracking-tight sm:text-5xl">Selected arrivals</h2></div>
          <Link href="/inventory" data-testid="link-home-all-inventory" className="ink-link inline-flex items-center gap-2 self-start text-sm font-semibold text-primary sm:self-auto">See all available <ArrowUpRight size={16} /></Link>
        </div>
        {featured.length === 0 ? <EmptyState label="The next arrivals are being inspected now." /> : <div className="mt-10 grid gap-6 md:grid-cols-3">{featured.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>}
      </section>
      <section className="border-y border-border bg-muted/45">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[.85fr_1.15fr] md:items-center lg:px-12 lg:py-24">
          <div><p className="label-mono text-primary">Why Carril</p><h2 className="display-serif mt-4 max-w-md text-4xl leading-tight sm:text-5xl">A clear-eyed way to buy an old car.</h2><p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">Every car gets a proper look, a documented story, and a plan for the road south. We are here to remove the fog from a purchase that should feel exciting.</p></div>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: 'Provenance first', text: 'We trace ownership, condition, and the details that matter before a car earns a place on our desk.' },
              { icon: Compass, title: 'A human eye', text: 'No anonymous auctions or mystery listings. We know why each car is interesting.' },
              { icon: Truck, title: 'Road south, handled', text: 'From collection in the States to customs coordination in Mexico, the handoffs are ours.' },
              { icon: MessageCircle, title: 'Straight answers', text: 'Ask the awkward questions. Our advice is candid, specific, and always in your corner.' },
            ].map(({ icon: Icon, title, text }) => <div key={title} className="bg-card p-6 sm:p-7"><Icon size={20} className="text-primary" /><h3 className="mt-8 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="label-mono text-primary">Placed with care</p><h2 className="display-serif mt-3 text-4xl sm:text-5xl">Recent stories</h2></div><Link href="/sold" data-testid="link-home-sold" className="ink-link inline-flex items-center gap-2 text-sm font-semibold text-primary">Open the archive <ArrowUpRight size={16} /></Link></div>
        {soldItems.length === 0 ? <EmptyState label="Our archive is being updated." /> : <div className="mt-10 grid gap-6 md:grid-cols-3">{soldItems.map((vehicle) => <SoldCard key={vehicle.id} vehicle={vehicle} />)}</div>}
      </section>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12 lg:py-20">
          <div><p className="label-mono text-accent">A car is only half the journey</p><h2 className="display-serif mt-4 max-w-xl text-4xl leading-tight sm:text-5xl">The road from USA to Mexico, made legible.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-primary-foreground/75">Collection, transport, import guidance, and the details between. We can help you bring a car across with fewer surprises.</p></div>
          <Link href="/transport" data-testid="link-home-transport" className="inline-flex shrink-0 items-center gap-2 border border-primary-foreground/45 px-5 py-3.5 text-sm font-semibold hover:bg-primary-foreground hover:text-primary">Explore transport & import <ArrowRight size={16} /></Link>
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
        <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-24"><p className="label-mono text-primary">The current ledger</p><div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h1 className="display-serif text-5xl tracking-tight sm:text-7xl">Available cars</h1><p className="max-w-sm text-sm leading-6 text-muted-foreground">Interesting shapes, honest descriptions, and a route south for every one.</p></div></div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="flex flex-col gap-3 border border-border bg-card p-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search make, model, or a detail…" aria-label="Search inventory" data-testid="input-inventory-search" className="w-full bg-transparent py-3 pl-10 pr-3 text-sm outline-none" /></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 border border-border px-3 text-sm"><Filter size={15} className="text-primary" /><select value={bodyStyle} onChange={(e) => setBodyStyle(e.target.value)} aria-label="Filter by body style" data-testid="select-inventory-body-style" className="bg-transparent py-3 outline-none"><option value="">All body styles</option>{bodyStyles.map((style) => <option key={style} value={style}>{style}</option>)}</select></label>
            <label className="flex items-center gap-2 border border-border px-3 text-sm"><span className="text-muted-foreground">Sort</span><select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort inventory" data-testid="select-inventory-sort" className="bg-transparent py-3 outline-none"><option value="featured">Selected first</option><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
          </div>
        </div>
        {query.isLoading ? <LoadingState label="Checking what is on the floor…" /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : (query.data?.length ?? 0) === 0 ? <EmptyState label="No cars match that search. Try a broader line." /> : <><div className="mt-8 flex items-center justify-between"><p className="label-mono text-muted-foreground" data-testid="text-inventory-count">{query.data?.length} vehicles on the ledger</p>{(search || bodyStyle) && <button type="button" onClick={() => { setSearch(''); setBodyStyle(''); }} data-testid="button-clear-filters" className="text-xs font-semibold text-primary hover:underline">Clear filters</button>}</div><div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{query.data?.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div></>}
      </section>
    </div>
  );
}

function InventoryDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const query = useGetInventoryVehicle(slug, { query: { queryKey: getGetInventoryVehicleQueryKey(slug) } });
  if (query.isLoading) return <LoadingState label="Pulling the vehicle file…" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} label="We could not find this vehicle." />;
  const vehicle = query.data;
  return (
    <div className="page-enter">
      <div className="mx-auto max-w-[1440px] px-5 pt-8 sm:px-8 lg:px-12"><Link href="/inventory" data-testid="link-back-inventory" className="ink-link inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ChevronLeft size={16} /> Back to available cars</Link></div>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.16fr_.84fr] lg:gap-16 lg:px-12 lg:py-14">
        <div><div className="relative aspect-[4/3] overflow-hidden bg-secondary"><ImageFrame src={vehicle.imageUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="h-full w-full" /><span className="absolute left-4 top-4 bg-accent px-3 py-2 label-mono text-accent-foreground">Available</span></div><div className="mt-8 border-t border-border pt-7"><p className="label-mono text-primary">The story</p><p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">{vehicle.description}</p></div></div>
        <div className="lg:pt-4"><p className="label-mono text-primary">{vehicle.year} · {vehicle.bodyStyle} · {vehicle.location}</p><h1 className="display-serif mt-4 text-5xl leading-[1.02] tracking-tight sm:text-6xl">{vehicle.make}<br /><span className="italic">{vehicle.model}</span></h1><p className="mt-6 font-mono text-2xl text-primary">{money.format(vehicle.price)}</p><p className="mt-2 text-sm text-muted-foreground">Before import, duties, and registration.</p><div className="mt-9 grid grid-cols-2 border-y border-border py-5"><DetailStat icon={Gauge} label="Mileage" value={`${miles.format(vehicle.mileage)} mi`} /><DetailStat icon={Fuel} label="Engine" value={vehicle.engine} /><DetailStat icon={Clock3} label="Transmission" value={vehicle.transmission} /><DetailStat icon={MapPin} label="Located in" value={vehicle.location} /></div><div className="mt-8"><InquiryDialog triggerLabel="Ask about this car" vehicleSlug={vehicle.slug} inquiryType="vehicle" fullWidth /><p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={14} className="text-primary" /> A specialist will reply with the full file and next steps.</p></div></div>
      </section>
      <section className="border-t border-border bg-muted/35"><div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-14 sm:px-8 md:grid-cols-3 lg:px-12"><div><p className="label-mono text-primary">Need the route?</p><h2 className="display-serif mt-2 text-3xl">We can bring it south.</h2></div><div className="md:col-span-2 grid gap-6 sm:grid-cols-3">{['Source & inspect', 'Collect in the USA', 'Clear into Mexico'].map((item, index) => <div key={item} className="flex gap-3"><span className="font-mono text-xs text-primary">0{index + 1}</span><p className="text-sm leading-6">{item}</p></div>)}</div></div></section>
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
  return <div className="page-enter"><section className="border-b border-border bg-secondary text-secondary-foreground"><div className="mx-auto max-w-[1440px] px-5 pb-14 pt-20 sm:px-8 lg:px-12 lg:pb-20 lg:pt-28"><p className="label-mono text-accent">The archive</p><h1 className="display-serif mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">Cars that found<br /><span className="italic text-accent">their people.</span></h1><p className="mt-7 max-w-lg text-base leading-7 text-secondary-foreground/70">A record of recent placements. Every one began as a conversation and ended with a set of keys changing hands.</p></div></section><section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : <><div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center"><p className="label-mono text-muted-foreground" data-testid="text-sold-count">{filtered.length} recent placements</p><div className="relative w-full sm:w-72"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the archive" aria-label="Search sold archive" data-testid="input-sold-search" className="w-full border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" /></div></div>{filtered.length === 0 ? <EmptyState label="No placements match that search." /> : <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((vehicle) => <SoldCard key={vehicle.id} vehicle={vehicle} />)}</div>}</>}</section></div>;
}

function Transport() {
  const services = useListServices({ query: { queryKey: getListServicesQueryKey() } });
  const serviceList = (services.data ?? []) as ImportService[];
  return <div className="page-enter"><section className="bg-primary text-primary-foreground"><div className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 pt-20 sm:px-8 md:grid-cols-[1.1fr_.9fr] md:items-end lg:px-12 lg:pb-24 lg:pt-28"><div><p className="label-mono text-accent">From driveway to destination</p><h1 className="display-serif mt-5 max-w-3xl text-5xl leading-[1.04] sm:text-7xl">The road south,<br /><span className="italic text-accent">handled.</span></h1></div><p className="max-w-sm text-sm leading-7 text-primary-foreground/75">A classic car crosses more than a border. Our transport and import desk keeps the route visible, the paperwork moving, and you informed at each handoff.</p></div></section><section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="grid gap-10 md:grid-cols-[.7fr_1.3fr]"><div><p className="label-mono text-primary">The service desk</p><h2 className="display-serif mt-3 max-w-sm text-4xl">A plan, not a shrug.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">Whether you are buying through us or already have a car waiting in the States, we can map the most sensible way to get it home.</p><div className="mt-8"><InquiryDialog triggerLabel="Talk through your route" inquiryType="transport" /></div></div>{services.isLoading ? <div className="animate-pulse space-y-3"><div className="h-28 bg-muted" /><div className="h-28 bg-muted" /></div> : services.isError ? <ErrorState onRetry={() => void services.refetch()} /> : serviceList.length === 0 ? <EmptyState label="Our transport desk is available for a custom route." /> : <div className="grid gap-4">{serviceList.map((service, index) => <ServiceRow key={service.id} service={service} index={index} />)}</div>}</div></section><section className="border-y border-border bg-muted/35"><div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20"><p className="label-mono text-primary">The handoff map</p><div className="mt-10 grid gap-0 md:grid-cols-4">{[{icon: Globe2, title: '01 / Source', text: 'We confirm the vehicle, seller, and collection details.'}, {icon: PackageCheck, title: '02 / Prepare', text: 'Documents, condition notes, and a route built around the car.'}, {icon: Truck, title: '03 / Move', text: 'Collection and transport with clear updates along the way.'}, {icon: Check, title: '04 / Arrive', text: 'Import guidance through the final local handoff.'}].map(({ icon: Icon, title, text }, index) => <div key={title} className={`border-l border-border px-5 py-2 first:border-l-0 md:px-6 ${index === 0 ? 'pl-0' : ''}`}><Icon size={19} className="text-primary" /><h3 className="mt-7 font-mono text-xs text-primary">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></div></section></div>;
}

function ServiceRow({ service, index }: { service: ImportService; index: number }) {
  return <article className="border border-border bg-card p-6 sm:p-8"><div className="flex items-start gap-5"><span className="font-mono text-sm text-primary">0{index + 1}</span><div className="flex-1"><h3 className="display-serif text-2xl">{service.name}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{service.description}</p>{service.details.length > 0 && <ul className="mt-6 grid gap-3 sm:grid-cols-2">{service.details.map((detail) => <li key={detail} className="flex gap-2 text-sm"><Check size={15} className="mt-0.5 shrink-0 text-primary" />{detail}</li>)}</ul>}</div><ChevronDown size={18} className="text-muted-foreground" /></div></article>;
}

function Seo() {
  const [location] = useLocation();
  useEffect(() => {
    const pages: Record<string, [string, string]> = {
      '/': ['Carril & Co. — Distinctive classic imports', 'Considered vintage vehicles, sourced in the USA and guided safely to Mexico.'],
      '/inventory': ['Available cars — Carril & Co.', 'Explore distinctive vintage vehicles currently available through Carril & Co.'],
      '/sold': ['The archive — Carril & Co.', 'Recent classic-car placements from the Carril & Co. archive.'],
      '/transport': ['Transport & import — Carril & Co.', 'USA-to-Mexico transport and import guidance for distinctive vintage vehicles.'],
    };
    const [title, description] = pages[location] ?? ['Carril & Co. — Classic imports', 'Distinctive vintage vehicles sourced with patience and brought home with clarity.'];
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
  return <ErrorBoundary resetKey={location}><Seo /><Shell><Switch><Route path="/" component={Home} /><Route path="/inventory" component={Inventory} /><Route path="/inventory/:slug" component={InventoryDetail} /><Route path="/sold" component={SoldArchive} /><Route path="/transport" component={Transport} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;