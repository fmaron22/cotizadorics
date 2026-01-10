import { Button } from "@/components/ui/button";
import { PlusCircle, Search, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col bg-background p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">ID-Secure Quoter</h1>
            <p className="text-muted-foreground mt-1">Sistema de cotización inteligente para tarjetas de alta seguridad.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/catalogs">
              <Button variant="outline" size="lg">
                Gestión de Catálogos
              </Button>
            </Link>
            <Link href="/quote">
              <Button size="lg" className="group">
                <PlusCircle className="mr-2 h-5 w-5" />
                Nueva Cotización
                <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats / Quick Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card border border-border/50 p-6 rounded-xl shadow-lg hover:border-primary/50 transition-colors">
            <span className="text-sm font-medium text-muted-foreground">Cotizaciones del Mes</span>
            <div className="text-2xl font-bold mt-2">12</div>
          </div>
          <div className="bg-card border border-border/50 p-6 rounded-xl shadow-lg hover:border-primary/50 transition-colors">
            <span className="text-sm font-medium text-muted-foreground">Tasa de Conversión</span>
            <div className="text-2xl font-bold mt-2 text-green-400">35%</div>
          </div>
          <div className="bg-card border border-border/50 p-6 rounded-xl shadow-lg hover:border-primary/50 transition-colors">
            <span className="text-sm font-medium text-muted-foreground">Volumen Total</span>
            <div className="text-2xl font-bold mt-2">1.2M</div>
          </div>
        </div>

        {/* Recent Quotes Table (Mock) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Historial Reciente</h2>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="w-full bg-card border border-input rounded-md pl-9 pr-4 py-2 text-sm ring-offset-background outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-card/50">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Volumen</th>
                  <th className="px-4 py-3">Estructura</th>
                  <th className="px-4 py-3">Precio Sug.</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {/* Mock Rows */}
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">Gobierno Costa de Marfil</td>
                  <td className="px-4 py-3">100,000</td>
                  <td className="px-4 py-3 text-xs"><span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded">Compuesto</span></td>
                  <td className="px-4 py-3 font-semibold text-green-400">$4.75</td>
                  <td className="px-4 py-3 text-muted-foreground">Hace 2 horas</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm"><FileText className="w-4 h-4" /></Button>
                  </td>
                </tr>
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">Banco Nacional</td>
                  <td className="px-4 py-3">25,000</td>
                  <td className="px-4 py-3 text-xs"><span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded">Policarbonato</span></td>
                  <td className="px-4 py-3 font-semibold text-green-400">$8.20</td>
                  <td className="px-4 py-3 text-muted-foreground">Ayer</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm"><FileText className="w-4 h-4" /></Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
