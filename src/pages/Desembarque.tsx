import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DisembarkingFormCatraca3 } from "@/components/DisembarkingFormCatraca3";
import { Badge } from "@/components/ui/badge";
import { catraca3Service } from "@/services/catraca3Service";
import { BoardingFormData, initialFormData } from "@/types/boarding";

const Desembarque = () => {
    // 1. ESTADO DE CONTAGEM (POLLED)
    const [passageirosCatraca3, setPassageirosCatraca3] = useState(0);

    // 2. ESTADO DO FORMULÁRIO (PERSISTÊNCIA)
    const [formData3, setFormData3] = useState<BoardingFormData>(initialFormData);

    // 3. ESTADO DE HABILITAÇÃO
    const [isEnabled3, setIsEnabled3] = useState(false);

    // =======================================================
    // POLLING PARA CATRACA 3
    // =======================================================
    useEffect(() => {
        const fetchContador3 = async () => {
            try {
                const total = await catraca3Service.getTotalDesembarcados();
                setPassageirosCatraca3(total);
            } catch (error) { }
        };
        fetchContador3();
        const intervalId = window.setInterval(fetchContador3, 3000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="p-6 max-w-7xl mx-auto">
                {/* Header com Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Desembarque de Aeronave</h2>
                    <div className="flex gap-3">
                        <Badge variant="outline" className="px-4 py-2 rounded-full">
                            Catraca 3: {passageirosCatraca3}
                        </Badge>
                        <Badge variant="default" className="px-4 py-2 rounded-full bg-green-600 text-white">
                            TOTAL GERAL: {passageirosCatraca3}
                        </Badge>
                    </div>
                </div>

                <h3 className="text-lg font-medium text-muted-foreground mb-6">
                    Catraca 3 - Registro de Voo
                </h3>

                <DisembarkingFormCatraca3
                    passageirosDesembarcados={passageirosCatraca3}
                    setPassageirosDesembarcados={setPassageirosCatraca3}
                    formData={formData3}
                    setFormData={setFormData3}
                    isEnabled={isEnabled3}
                    setIsEnabled={setIsEnabled3}
                />
            </main>
        </div>
    );
};

export default Desembarque;
