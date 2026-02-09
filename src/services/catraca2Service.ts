import { BoardingFormData } from "@/types/boarding";

const API_URL = "https://onepax-onepax.7y6zlt.easypanel.host";
const ID_CATRACA_2 = "1002";

export const catraca2Service = {
  async habilitarCatraca(): Promise<void> {
    console.log(`[Catraca 2] Habilitando Push para ID ${ID_CATRACA_2}`);
    // Inicia o voo globalmente
    await fetch(`${API_URL}/start-emb-flight/`, { method: "POST" });
    // Habilita especificamente a catraca 1002
    await fetch(`${API_URL}/api/catraca-push/${ID_CATRACA_2}/enable/`, { method: "POST" });
  },

  async encerrarVoo(): Promise<void> {
    console.log(`[Catraca 2] Desabilitando Push para ID ${ID_CATRACA_2}`);
    // Desabilita o push específico da 1002
    await fetch(`${API_URL}/api/catraca-push/${ID_CATRACA_2}/disable/`, { method: "POST" });
  },

  async liberarPassageiro(): Promise<void> {
    console.log("Simulação manual desativada.");
  },

  async contarEventos(): Promise<number> {
    return 0;
  },

  async getTotalDesembarcados(): Promise<number> {
    try {
      const res = await fetch(`${API_URL}/api/total-embarcados/${ID_CATRACA_2}/`);
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