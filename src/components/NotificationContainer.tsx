import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

export function NotificationContainer() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notificationIdRef = useRef(0);

    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalInfo = console.info;

        // Palavras-chave que indicam mensagens relevantes para o usuário
        const isRelevantMessage = (message: string): boolean => {
            const relevantKeywords = [
                'salvo',
                'consolidado',
                'replicado',
                'habilitada',
                'encerrado',
                'limpos',
                'erro',
                'sucesso',
                'aguardando',
                'giro'
            ];

            const irrelevantKeywords = [
                'desabilitando push',
                'habilitando push',
                'simulação',
                'warning',
                'catraca 1]',
                'catraca 2]',
                'catraca 3]'
            ];

            const lowerMessage = message.toLowerCase();

            // Ignora mensagens irrelevantes
            if (irrelevantKeywords.some(keyword => lowerMessage.includes(keyword))) {
                return false;
            }

            // Aceita mensagens relevantes
            return relevantKeywords.some(keyword => lowerMessage.includes(keyword));
        };

        console.log = (...args: any[]) => {
            originalLog(...args);
            const message = args.join(' ');
            if (message && typeof message === 'string' && isRelevantMessage(message)) {
                addNotification('success', message);
            }
        };

        console.error = (...args: any[]) => {
            originalError(...args);
            const message = args.join(' ');
            if (message && typeof message === 'string' && message.length > 0) {
                addNotification('error', message);
            }
        };

        console.info = (...args: any[]) => {
            originalInfo(...args);
            const message = args.join(' ');
            if (message && typeof message === 'string' && isRelevantMessage(message)) {
                addNotification('info', message);
            }
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.info = originalInfo;
        };
    }, []);

    const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
        // Evitar duplicatas - verificar se já existe notificação idêntica recente
        const isDuplicate = notifications.some(n =>
            n.message === message && n.type === type
        );

        if (isDuplicate) return;

        // Gerar ID único usando contador incremental
        notificationIdRef.current += 1;
        const id = `notif-${notificationIdRef.current}`;

        setNotifications(prev => [...prev, { id, type, message }]);

        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-600" />;
            default:
                return null;
        }
    };

    const getBackgroundColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${getBackgroundColor(notification.type)}`}
                >
                    {getIcon(notification.type)}
                    <p className="flex-1 text-sm font-medium text-gray-900">
                        {notification.message}
                    </p>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
