const API_URL = import.meta.env.VITE_API_URL;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatService = {
  async sendMessage(message: string, history: ChatMessage[]): Promise<string> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/central-analise/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Erro ao enviar mensagem');
    }

    const data = await response.json();
    return data.reply;
  },
};
