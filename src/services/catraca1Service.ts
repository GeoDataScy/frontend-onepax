import { BoardingFormData } from "@/types/boarding";

const API_URL = "https://onepax-onepax.7y6zlt.easypanel.host";
const ID_CATRACA_1 = "1001";

export const catraca1Service = {
  async habilitarCatraca(): Promise<void> {
    console.log(`[Catraca 1] Habilitando Push para ID ${ID_CATRACA_1}`);
    // Primeiro garantimos que o voo está iniciado globalmente
    await fetch(`${API_URL}/start-emb-flight/`, { method: "POST" });
    // DEPOIS habilitamos especificamente o push desta catraca
    await fetch(`${API_URL}/api/catraca-push/${ID_CATRACA_1}/enable/`, { method: "POST" });
  },

  async encerrarVoo(): Promise<void> {
    console.log(`[Catraca 1] Desabilitando Push para ID ${ID_CATRACA_1}`);
    // Desabilita o push específico desta catraca
    await fetch(`${API_URL}/api/catraca-push/${ID_CATRACA_1}/disable/`, { method: "POST" });
    // Opcional: Se quiser encerrar o voo globalmente no banco (afeta todas)
    // await fetch(`${API_URL}/stop-emb-flight/`, { method: "POST" });
  },

  async liberarPassageiro(): Promise<void> {
    console.log("Simulação manual desativada.");
  },

  async contarEventos(): Promise<number> {
    return 0;
  },

  async getTotalEmbarcados(): Promise<number> {
    try {
      const res = await fetch(`${API_URL}/api/total-embarcados/${ID_CATRACA_1}/`);
      const data = await res.json();
      return data.total_embarcados;
    } catch (error) {
      return 0;
    }
  },

  async salvarDados(formData: BoardingFormData): Promise<void> {
    const response = await fetch(`${API_URL}/salvar-embarque/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (data.status === 'success') {
      console.log(`Voo ${formData.numeroVoo} salvo! Total: ${data.total_passageiros} passageiros`);
    } else {
      console.error("Erro ao salvar: " + data.message);
    }
  },
};