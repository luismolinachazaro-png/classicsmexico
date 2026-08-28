import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-[65dvh] items-center justify-center bg-muted/30 px-5 py-24">
      <div className="w-full max-w-lg border border-border bg-card p-8 sm:p-12" data-testid="status-not-found">
        <Compass size={25} className="text-primary" />
        <p className="label-mono mt-8 text-primary">Tomaste otra ruta</p>
        <h1 className="display-serif mt-3 text-5xl">Este camino termina aquí.</h1>
        <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">Esta página no está en nuestro mapa. Regresemos a los autos.</p>
        <Link href="/" data-testid="link-not-found-home" className="mt-8 inline-flex items-center gap-2 border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"><ArrowLeft size={16} /> Volver al inicio</Link>
      </div>
    </div>
  );
}
