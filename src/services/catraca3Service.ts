import { BoardingFormData } from "@/types/boarding";

const API_URL = "https://onepax-onepax.7y6zlt.easypanel.host";
const ID_CATRACA_3 = "1003"; // 3ª Catraca para Desembarque

export const catraca3Service = {
    async habilitarCatraca(): Promise<void> {
        console.log(`[Catraca 3] Habilitando Push para ID ${ID_CATRACA_3}`);
        // Inicia o voo de desembarque globalmente
        await fetch(`${API_URL}/start-desemb-flight/`, { method: "POST" });
        // Habilita especificamente o push desta catraca
        await fetch(`${API_URL}/api/catraca-push/${ID_CATRACA_3}/enable/`, { method: "POST" });
    },

    async encerrarVoo(): Promise<void> {
        console.log(`[Catraca 3] Desabilitando Push para ID ${ID_CATRACA_3}`);
        // Desabilita o push específico desta catraca
        await fetch(`${API_URL}/api/catraca-push/${ID_CATRACA_3}/disable/`, { method: "POST" });
    },

    async liberarPassageiro(): Promise<void> {
        const res = await fetch(`${API_URL}/desembarque/push/?deviceId=${ID_CATRACA_3}`);
        if (!res.ok) throw new Error(`Erro ao liberar Catraca 3: ${res.status}`);
    },

    async contarEventos(): Promise<number> {
        return 0;
    },

    async getTotalDesembarcados(): Promise<number> {
        try {
            const res = await fetch(`${API_URL}/api/total-desembarcados/${ID_CATRACA_3}/`);
            const data = await res.json();
            return data.total_desembarcados;
        } catch (error) {
            return 0;
        }
    },

    async salvarDados(formData: any): Promise<void> {
        const response = await fetch(`${API_URL}/salvar-desembarque/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (data.status === 'success') {
            console.log(`Desembarque do voo ${formData.numeroVoo} salvo!`);
        } else {
            console.error("Erro ao salvar: " + data.message);
        }
    },
};
