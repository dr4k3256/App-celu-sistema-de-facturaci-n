import React, { useState, useEffect } from 'react';
import { User, Plus } from 'lucide-react';
import { useDependencies } from '../../application/DependenciesContext';
import { Client } from '../../domain/models';
import { useAlert } from '../context/AlertContext';
import { useTranslation } from 'react-i18next';

const Clients = () => {
    const { clientUseCases } = useDependencies();
    const { showToast } = useAlert();
    const { t } = useTranslation();
    const [clients, setClients] = useState<Client[]>([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchClients = async () => {
        try {
            const data = await clientUseCases.getClients();
            setClients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching clients:', error);
            showToast(t('clients.fetchError') || 'Error fetching clients', 'error');
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleSaveClient = async () => {
        if (!name.trim()) {
            return showToast(t('clients.invalidName') || 'Invalid name', 'error');
        }

        setLoading(true);
        try {
            await clientUseCases.saveClient({ name: name.trim(), phone: phone.trim() });
            showToast(t('clients.saveClient') + ' ✓', 'success');
            setName('');
            setPhone('');
            await fetchClients();
        } catch (error) {
            console.error('Error saving client:', error);
            showToast(t('clients.saveError') || 'Error saving client', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Form */}
                <div className="glass p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl glass grid place-items-center text-blue-400">
                            <User size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{t('clients.registerClient')}</h2>
                            <p className="text-sm text-muted-foreground">{t('clients.registerDesc')}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-muted-foreground">{t('clients.name')}</label>
                            <input
                                type="text"
                                className="w-full glass px-3 py-2 mt-1 text-sm outline-none rounded-lg"
                                placeholder={t('clients.namePlaceholder')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveClient()}
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-muted-foreground">{t('clients.phone')}</label>
                            <input
                                type="text"
                                className="w-full glass px-3 py-2 mt-1 text-sm outline-none rounded-lg"
                                placeholder={t('clients.phonePlaceholder')}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveClient()}
                            />
                        </div>
                        <button
                            onClick={handleSaveClient}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <Plus size={16} /> {loading ? t('common.loading') : t('clients.saveClient')}
                        </button>
                    </div>
                </div>

                {/* Client List */}
                <div className="xl:col-span-2 glass p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-bold">{t('clients.clientList')}</h2>
                            <p className="text-sm text-muted-foreground">{t('clients.clientListDesc')}</p>
                        </div>
                        <span className="text-xs text-muted-foreground bg-accent/40 px-2 py-1 rounded-full">{clients.length}</span>
                    </div>

                    {clients.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                            <User size={36} className="mb-3 opacity-30" />
                            <p className="text-sm">{t('clients.noClients')}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {clients.map((client) => (
                                <div key={client.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/20 border border-border/50 hover:bg-accent/30 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                                            {(client.name || 'C')[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{client.name}</p>
                                            <p className="text-[11px] text-muted-foreground">{client.phone || t('clients.noPhone')}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2 hidden sm:block">{client.id}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Clients;
