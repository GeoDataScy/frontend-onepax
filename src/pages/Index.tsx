import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { CatracaTabs } from "@/components/CatracaTabs";
import { BoardingFormCatraca1 } from "@/components/BoardingFormCatraca1";
import { BoardingFormCatraca2 } from "@/components/BoardingFormCatraca2";
import { Badge } from "@/components/ui/badge";
import { catraca1Service } from "@/services/catraca1Service";
import { catraca2Service } from "@/services/catraca2Service";
// Importamos o tipo e o estado inicial para persistir os dados
import { BoardingFormData, initialFormData } from "@/types/boarding";

const Index = () => {
  const [activeCatraca, setActiveCatraca] = useState<1 | 2>(1);

  // 1. ESTADOS DE CONTAGEM (POLLED)
  const [passageirosCatraca1, setPassageirosCatraca1] = useState(0);
  const [passageirosCatraca2, setPassageirosCatraca2] = useState(0);

  // 2. ESTADOS DOS FORMULÁRIOS (PERSISTÊNCIA AO TROCAR DE ABA)
  const [formData1, setFormData1] = useState<BoardingFormData>(initialFormData);
  const [formData2, setFormData2] = useState<BoardingFormData>(initialFormData);

  // 3. ESTADO DE HABILITAÇÃO (PERSISTÊNCIA DO BOTÃO ATIVO)
  const [isEnabled1, setIsEnabled1] = useState(false);
  const [isEnabled2, setIsEnabled2] = useState(false);

  // 4. ESTADO DE REPLICAÇÃO (CONTROLE DE VOOS VINCULADOS)
  const [voosReplicados, setVoosReplicados] = useState(false);

  // =======================================================
  // POLLING PARA CATRACA 1
  // =======================================================
  useEffect(() => {
    const fetchContador1 = async () => {
      try {
        const total = await catraca1Service.getTotalEmbarcados();
        setPassageirosCatraca1(total);
      } catch (error) { }
    };
    fetchContador1();
    const intervalId = window.setInterval(fetchContador1, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // =======================================================
  // POLLING PARA CATRACA 2
  // =======================================================
  useEffect(() => {
    const fetchContador2 = async () => {
      try {
        const total = await catraca2Service.getTotalDesembarcados();
        setPassageirosCatraca2(total);
      } catch (error) { }
    };
    fetchContador2();
    const intervalId = window.setInterval(fetchContador2, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const passageirosEmbarcadosTotal = passageirosCatraca1 + passageirosCatraca2;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="p-6 max-w-7xl mx-auto">
        {/* Header com Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Embarque de Aeronave</h2>
          <div className="flex gap-3">
            <Badge variant="outline" className="px-4 py-2 rounded-full">
              Catraca 1: {passageirosCatraca1}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 rounded-full">
              Catraca 2: {passageirosCatraca2}
            </Badge>
            <Badge variant="default" className="px-4 py-2 rounded-full bg-green-600 text-white">
              TOTAL GERAL: {passageirosEmbarcadosTotal}
            </Badge>
          </div>
        </div>

        {/* Abas */}
        <div className="mb-4">
          <CatracaTabs activeCatraca={activeCatraca} onTabChange={setActiveCatraca} />
        </div>

        <h3 className="text-lg font-medium text-muted-foreground mb-6">
          {activeCatraca === 1 ? "Catraca 1 - Registro de Voo" : "Catraca 2 - Registro de Voo"}
        </h3>

        {/* IMPORTANTE: Agora passamos formData e setFormData como Props.
            Isso garante que ao trocar do 1 para o 2, os dados não sumam.
        */}
        {activeCatraca === 1 ? (
          <BoardingFormCatraca1
            passageirosEmbarcados={passageirosCatraca1}
            setPassageirosEmbarcados={setPassageirosCatraca1}
            formData={formData1}
            setFormData={setFormData1}
            isEnabled={isEnabled1}
            setIsEnabled={setIsEnabled1}
            voosReplicados={voosReplicados}
            setVoosReplicados={setVoosReplicados}
            formDataOutraCatraca={formData2}
            passageirosOutraCatraca={passageirosCatraca2}
          />
        ) : (
          <BoardingFormCatraca2
            passageirosEmbarcados={passageirosCatraca2}
            setPassageirosEmbarcados={setPassageirosCatraca2}
            formData={formData2}
            setFormData={setFormData2}
            isEnabled={isEnabled2}
            setIsEnabled={setIsEnabled2}
            voosReplicados={voosReplicados}
            setVoosReplicados={setVoosReplicados}
            formDataCatraca1={formData1}
            passageirosCatraca1={passageirosCatraca1}
          />
        )}
      </main>
    </div>
  );
};

export default Index;