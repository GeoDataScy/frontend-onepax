import { Navbar } from "@/components/Navbar";
import { Construction } from "lucide-react";

const Transporte = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Transporte</h2>
                </div>

                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Construction className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">Em construção</p>
                    <p className="text-sm mt-1">Este módulo está sendo desenvolvido.</p>
                </div>
            </main>
        </div>
    );
};

export default Transporte;
