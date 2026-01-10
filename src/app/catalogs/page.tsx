import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMaterials, getChips, getProcesses, getSecurityFeatures } from "@/app/actions";
import { CatalogTable } from "./catalog-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CatalogsPage() {
    // Fetch initial data
    const [materials, chips, processes, features] = await Promise.all([
        getMaterials(),
        getChips(),
        getProcesses(),
        getSecurityFeatures()
    ]);

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Catálogos</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    Modo Datos Simulados (Mock)
                </div>
            </div>

            <Tabs defaultValue="materials" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="materials">Materiales</TabsTrigger>
                    <TabsTrigger value="chips">Chips</TabsTrigger>
                    <TabsTrigger value="processes">Procesos</TabsTrigger>
                    <TabsTrigger value="features">Seguridad</TabsTrigger>
                </TabsList>

                <TabsContent value="materials">
                    <div className="border rounded-md p-4">
                        <CatalogTable data={materials} type="material" />
                    </div>
                </TabsContent>

                <TabsContent value="chips">
                    <div className="border rounded-md p-4">
                        <CatalogTable data={chips} type="chip" />
                    </div>
                </TabsContent>

                <TabsContent value="processes">
                    <div className="border rounded-md p-4">
                        <CatalogTable data={processes} type="process" />
                    </div>
                </TabsContent>

                <TabsContent value="features">
                    <div className="border rounded-md p-4">
                        <CatalogTable data={features} type="feature" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
