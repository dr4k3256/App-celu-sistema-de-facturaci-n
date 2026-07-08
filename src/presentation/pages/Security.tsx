import React, { useState, useEffect, useRef } from 'react';
import { Shield, Key, Users, ShieldCheck, Eye, EyeOff, CheckCircle, Download, Upload, Save } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useDependencies } from '../../application/DependenciesContext';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ChangePasswordForm = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { showToast } = useAlert();
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast(t('security.passwordMismatch'), 'error');
            return;
        }
        if (newPassword.length < 6) {
            showToast(t('security.passwordTooShort'), 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            if (!res.ok) throw new Error('Contraseña actual incorrecta');
            showToast(t('security.passwordChanged'), 'success');
            setSuccess(true);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setTimeout(() => setSuccess(false), 4000);
        } catch (err: any) {
            showToast(err.message || 'Error al cambiar la contraseña', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                    <CheckCircle size={16} /> {t('security.passwordChanged')}
                </div>
            )}
            <div className="relative">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t('security.currentPassword')}</label>
                <div className="flex items-center border-b border-border">
                    <input
                        type={showCurrent ? 'text' : 'password'}
                        className="flex-1 bg-transparent py-2 text-sm outline-none"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-muted-foreground">
                        {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
            </div>
            <div className="relative">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t('security.newPassword')}</label>
                <div className="flex items-center border-b border-border">
                    <input
                        type={showNew ? 'text' : 'password'}
                        className="flex-1 bg-transparent py-2 text-sm outline-none"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="text-muted-foreground">
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
            </div>
            <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t('security.confirmPassword')}</label>
                <input
                    type="password"
                    className="w-full bg-transparent border-b border-border py-2 text-sm outline-none"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <div className="pt-2">
                {newPassword && (
                    <div className="mb-3">
                        <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`flex-1 h-1 rounded ${newPassword.length >= i * 2 ? (newPassword.length >= 8 ? 'bg-green-500' : 'bg-orange-500') : 'bg-accent'}`} />
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            {newPassword.length < 4 ? t('security.passwordStrengthWeak') : newPassword.length < 8 ? t('security.passwordStrengthOk') : t('security.passwordStrengthGood')}
                        </p>
                    </div>
                )}
                <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                    {loading ? t('security.changing') : t('security.changePasswordBtn')}
                </button>
            </div>
        </form>
    );
};

const BackupRestorePanel = ({ autoOpen }: { autoOpen?: boolean }) => {
    const { backupUseCases } = useDependencies();
    const { showToast, confirm } = useAlert();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoOpen && panelRef.current) {
            panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => fileInputRef.current?.click(), 700);
        }
    }, [autoOpen]);

    const handleExport = async () => {
        try {
            setLoading(true);
            const data = await backupUseCases.exportBackup();
            const fileName = `backup_facturacion_${new Date().toISOString().slice(0, 10)}.json`;

            if (Capacitor.isNativePlatform()) {
                try {
                    await Filesystem.writeFile({
                        path: fileName,
                        data: data,
                        directory: Directory.Documents,
                        encoding: Encoding.UTF8
                    });
                    showToast(`${t('security.exportSuccess')}. Archivo guardado en Documentos/${fileName}`, 'success');
                } catch (e: any) {
                    showToast(`Error al guardar archivo: ${e.message}`, 'error');
                }
            } else {
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
                showToast(t('security.exportSuccess'), 'success');
            }
        } catch (err: any) {
            showToast(t('security.exportError'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ok = await confirm({
            title: t('security.importConfirmTitle'),
            message: t('security.importConfirmMsg'),
            type: 'danger',
            confirmText: t('security.importConfirmBtn'),
            cancelText: t('common.cancel')
        });

        if (!ok) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                await backupUseCases.importBackup(text);
                showToast(t('security.importSuccess'), 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch (err: any) {
                showToast(t('security.importError'), 'error');
                if (fileInputRef.current) fileInputRef.current.value = '';
            } finally {
                setLoading(false);
            }
        };
        reader.onerror = () => {
            showToast(t('security.importError'), 'error');
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div ref={panelRef} className={`glass p-6 transition-all duration-300 ${autoOpen ? 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/10' : ''}`}>
            <h4 className="font-semibold mb-4 flex items-center space-x-2">
                <Save size={20} className="text-green-500" />
                <span>{t('security.backupTitle')}</span>
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
                {t('security.backupDesc')}
            </p>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleExport}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-4 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl transition-colors border border-green-500/20"
                >
                    <Download size={24} className="mb-2" />
                    <span className="text-xs font-bold uppercase">{t('security.exportData')}</span>
                </button>
                <button
                    onClick={handleImportClick}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/20"
                >
                    <Upload size={24} className="mb-2" />
                    <span className="text-xs font-bold uppercase">{t('security.importData')}</span>
                </button>
                <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
};

const Security = ({ openBackupOnMount }: { openBackupOnMount?: boolean }) => {
    const location = useLocation();
    const openBackup = openBackupOnMount || (location.state as any)?.openBackup === true;
    const { t } = useTranslation();
    const [users, setUsers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('CASHIER');
    const [creating, setCreating] = useState(false);
    const { showToast, confirm } = useAlert();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState('CASHIER');
    const [editPassword, setEditPassword] = useState('');
    const [updating, setUpdating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('current_user');
            if (raw) setCurrentUser(JSON.parse(raw));
        } catch (e) {
            setCurrentUser(null);
        }
    }, []);

    const fetchUsers = async () => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;
        try {
            const base = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';
            const token = localStorage.getItem('auth_token');
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${base}/users`, { headers });
            if (!res.ok) throw new Error('No se pudo obtener usuarios');
            const data = await res.json();
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    useEffect(() => { fetchUsers(); }, [currentUser]);

    const createUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername || !newPassword) return;
        setCreating(true);
        try {
            const base = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${base}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ username: newUsername, password: newPassword, name: newName, role: newRole })
            });
            if (!res.ok) throw new Error('Error creando usuario');
            setNewUsername(''); setNewName(''); setNewPassword(''); setNewRole('CASHIER');
            await fetchUsers();
            showToast('Usuario creado', 'success');
        } catch (err: any) {
            console.error('Create user error', err);
            showToast(err.message || 'No se pudo crear el usuario', 'error');
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (u: any) => {
        setEditingId(u.id || u.username);
        setEditName(u.name || u.fullName || '');
        setEditRole(u.role || (u.roles && u.roles[0]) || 'CASHIER');
        setEditPassword('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName(''); setEditRole('CASHIER'); setEditPassword('');
    };

    const submitUpdate = async (id: string) => {
        setUpdating(true);
        try {
            const base = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';
            const token = localStorage.getItem('auth_token');
            const body: any = { name: editName, role: editRole };
            if (editPassword) body.password = editPassword;
            const res = await fetch(`${base}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Error actualizando usuario');
            await fetchUsers();
            cancelEdit();
            showToast('Usuario actualizado', 'success');
        } catch (err: any) {
            showToast(err.message || 'No se pudo actualizar', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const deleteUser = async (id: string) => {
        const ok = await confirm({ title: 'Eliminar usuario', message: '¿Eliminar usuario? Esta acción no se puede deshacer.', type: 'danger', confirmText: 'Eliminar', cancelText: 'Cancelar' });
        if (!ok) return;
        setDeletingId(id);
        try {
            const base = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${base}/users/${id}`, { method: 'DELETE', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
            if (!res.ok) throw new Error('Error eliminando usuario');
            await fetchUsers();
            showToast('Usuario eliminado', 'success');
        } catch (err: any) {
            showToast(err.message || 'No se pudo eliminar', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="text-blue-500" /> {t('security.title')}
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Management */}
                <div className="lg:col-span-2 glass p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-semibold flex items-center space-x-2">
                            <Users size={20} className="text-blue-400" />
                            <span>{t('security.users')}</span>
                        </h4>
                    </div>
                    {!currentUser ? (
                        <div className="p-6 text-sm text-muted-foreground">{t('security.loginRequired')}</div>
                    ) : currentUser.role !== 'ADMIN' ? (
                        <div className="p-6 text-sm text-muted-foreground">{t('security.notAuthorized')}</div>
                    ) : (
                        <div className="space-y-3">
                            <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t('security.username')}</label>
                                    <input className="w-full bg-transparent border-b border-border py-2 text-sm outline-none" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t('security.name')}</label>
                                    <input className="w-full bg-transparent border-b border-border py-2 text-sm outline-none" value={newName} onChange={e => setNewName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t('security.password')}</label>
                                    <input type="password" className="w-full bg-transparent border-b border-border py-2 text-sm outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t('security.role')}</label>
                                    <select className="w-full bg-transparent border-b border-border py-2 text-sm outline-none" value={newRole} onChange={e => setNewRole(e.target.value)}>
                                        <option value="CASHIER">{t('security.cashier')}</option>
                                        <option value="ADMIN">{t('security.admin')}</option>
                                    </select>
                                </div>
                                <div className="md:col-span-4">
                                    <button type="submit" disabled={creating} className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold">
                                        {creating ? t('security.creating') : t('security.createUser')}
                                    </button>
                                </div>
                            </form>

                            {users.map((u: any) => {
                                const id = u.id || u.username || u.user || u.name;
                                const isEditing = editingId === id;
                                return (
                                    <div key={id} className="p-4 bg-accent/20 rounded-xl border border-border/50">
                                        {!isEditing ? (
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {(u.username || u.user || u.name || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{u.name || u.fullName || u.username}</p>
                                                        <p className="text-xs text-muted-foreground">@{u.username || u.user}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                        {u.role || (u.roles && u.roles[0]) || 'USER'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => startEdit(u)} className="py-1 px-2 bg-yellow-500/10 text-yellow-400 rounded">{t('common.edit')}</button>
                                                        <button type="button" onClick={() => deleteUser(id)} disabled={deletingId === id} className="py-1 px-2 bg-red-600 text-white rounded">{deletingId === id ? '...' : t('common.delete')}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                                                <div>
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t('security.name')}</label>
                                                    <input className="w-full bg-transparent border-b border-border py-2 text-sm outline-none" value={editName} onChange={e => setEditName(e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t('security.password')} (opcional)</label>
                                                    <input type="password" className="w-full bg-transparent border-b border-border py-2 text-sm outline-none" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t('security.role')}</label>
                                                    <select className="w-full bg-transparent border-b border-border py-2 text-sm outline-none" value={editRole} onChange={e => setEditRole(e.target.value)}>
                                                        <option value="CASHIER">{t('security.cashier')}</option>
                                                        <option value="ADMIN">{t('security.admin')}</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-2 flex gap-2 justify-end">
                                                    <button onClick={() => submitUpdate(id)} disabled={updating} className="py-2 px-4 bg-blue-600 text-white rounded-xl">{updating ? t('security.saving') : t('security.save')}</button>
                                                    <button onClick={cancelEdit} className="py-2 px-4 bg-border text-sm rounded-xl">{t('common.cancel')}</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Change Password */}
                    <div className="glass p-6">
                        <h4 className="font-semibold mb-6 flex items-center space-x-2">
                            <Key size={20} className="text-amber-400" />
                            <span>{t('security.changePassword')}</span>
                        </h4>
                        <ChangePasswordForm />
                    </div>

                    {/* Backup & Restore */}
                    <BackupRestorePanel autoOpen={openBackup} />

                    {/* System status */}
                    <div className="glass p-6 bg-blue-600/5 border border-blue-600/20">
                        <h4 className="font-semibold mb-2 flex items-center space-x-2 text-blue-400">
                            <ShieldCheck size={20} />
                            <span>{t('security.systemStatus')}</span>
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {t('security.systemDesc')}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-400 font-bold">{t('security.operational')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Security;
