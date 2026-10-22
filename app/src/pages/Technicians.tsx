import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, X, Loader2, Link as LinkIcon, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

interface User {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    status?: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'TECH';
}

export function Technicians() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [invitationLink, setInvitationLink] = useState<string | null>(null);

    const { user: currentUser } = useAuth();
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const isAdmin = currentUser?.role === 'ADMIN' || isSuperAdmin;

    // Form State (Edit)
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        role: 'TECH' as User['role'],
        status: 'ACTIVE'
    });

    // Form State (Invite)
    const [inviteRole, setInviteRole] = useState<User['role']>('TECH');

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || 'Error al conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (editingUserId && !payload.password) {
                delete (payload as any).password;
            }

            await apiClient.put(`/users/${editingUserId}`, payload);
            setIsEditModalOpen(false);
            setEditingUserId(null);
            fetchUsers();
        } catch (err: any) {
            console.error('Failed to update user', err);
            alert(err.response?.data || 'Error al actualizar usuario.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInviteUser = async () => {
        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/users/invite', { role: inviteRole });
            const token = response.data;
            const baseUrl = window.location.origin;
            setInvitationLink(`${baseUrl}/register?token=${token}`);
        } catch (err: any) {
            console.error('Failed to generate invitation', err);
            alert('Error al generar enlace de invitación.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (targetUser: User) => {
        setEditingUserId(targetUser.id);
        setFormData({
            nombre: targetUser.nombre || '',
            apellido: targetUser.apellido || '',
            email: targetUser.email || '',
            telefono: targetUser.telefono || '',
            password: '',
            role: targetUser.role,
            status: targetUser.status || 'ACTIVE'
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Confirmas la eliminación de este usuario del sistema?")) return;
        try {
            await apiClient.delete(`/users/${id}`);
            fetchUsers();
        } catch (err: any) {
            console.error('Failed to delete user', err);
            alert(err.response?.data || 'Error al eliminar usuario.');
        }
    };

    const canEdit = (targetUser: User) => {
        if (isSuperAdmin) return true;
        if (currentUser?.id === targetUser.id) return true;
        if (isAdmin && targetUser.role === 'TECH') return true;
        return false;
    };

    const canDelete = (targetUser: User) => {
        if (targetUser.role === 'SUPER_ADMIN') return false;
        if (isSuperAdmin) return true;
        if (isAdmin && targetUser.role === 'TECH') return true;
        return false;
    };

    const filteredUsers = users.filter(u =>
        u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header Industrial */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-300 dark:border-[#333639]">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-6 bg-amber-500 inline-block"></span>
                        <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                            Técnicos & Usuarios del Sistema
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-4.5">
                        Directorio de personal electromecánico, roles de acceso y credenciales activas.
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => {
                            setInvitationLink(null);
                            setIsInviteModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-none font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <LinkIcon size={16} />
                        <span>Invitar Nuevo Usuario</span>
                    </button>
                )}
            </div>

            {/* Barra de Búsqueda Angular */}
            <div className="flex items-center gap-3 bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] p-2.5 rounded-none shadow-xs">
                <Search className="w-4 h-4 text-slate-400 ml-1" />
                <input
                    type="text"
                    placeholder="Buscar técnico por nombre, apellido o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 font-sans"
                />
            </div>

            {/* Tabla Angular Industrial */}
            <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none overflow-hidden shadow-xs">
                <div className="overflow-x-auto min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                            <Loader2 className="animate-spin text-amber-500 mb-3" size={28} />
                            <p className="text-xs font-mono uppercase tracking-widest">Cargando directorio de técnicos...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-12 text-rose-500">
                            <AlertCircle size={32} className="mb-2 opacity-50" />
                            <p className="font-medium text-center text-xs">{error}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-[#141517] rounded-none flex items-center justify-center mb-3 border border-slate-300 dark:border-[#333639]">
                                <Plus size={20} className="text-slate-400" />
                            </div>
                            <p className="font-heading font-bold text-slate-700 dark:text-slate-200 text-sm uppercase">Sin usuarios registrados</p>
                            <p className="text-xs mt-1">Genera un enlace de invitación para añadir técnicos.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#f1f3f5] dark:bg-[#141517] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-heading font-bold border-b border-slate-300 dark:border-[#333639] tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Técnico / Nombre</th>
                                    <th className="px-5 py-3 hidden md:table-cell">Email & Teléfono</th>
                                    <th className="px-5 py-3 text-center">Rol Asignado</th>
                                    <th className="px-5 py-3 text-center hidden sm:table-cell">Estado</th>
                                    <th className="px-5 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-[#333639]">
                                {filteredUsers.map((targetUser) => (
                                    <tr key={targetUser.id} className="hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-none bg-slate-200 dark:bg-[#141517] text-amber-500 border border-slate-300 dark:border-[#333639] flex items-center justify-center font-heading font-black text-xs">
                                                    {(targetUser.nombre?.charAt(0) || '') + (targetUser.apellido?.charAt(0) || '')}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">{targetUser.nombre} {targetUser.apellido}</div>
                                                    <div className="text-[11px] text-slate-400 md:hidden">{targetUser.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs hidden md:table-cell">
                                            <div>{targetUser.email || '-'}</div>
                                            <div className="text-[11px] text-slate-400">{targetUser.telefono || 'Sin teléfono'}</div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                                targetUser.role === 'SUPER_ADMIN' 
                                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                targetUser.role === 'ADMIN' 
                                                    ? 'bg-slate-200 dark:bg-[#141517] text-slate-800 dark:text-slate-200 border-slate-400 dark:border-[#333639]' :
                                                    'bg-slate-100 dark:bg-[#141517] text-slate-600 dark:text-slate-400 border-slate-300 dark:border-[#333639]'
                                            }`}>
                                                {targetUser.role === 'SUPER_ADMIN' ? 'Super Admin' : targetUser.role === 'ADMIN' ? 'Administrador' : 'Técnico'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                                            <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase border ${
                                                (!targetUser.status || targetUser.status === 'ACTIVE') 
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                            }`}>
                                                {targetUser.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex gap-1 justify-end">
                                                {canEdit(targetUser) && (
                                                    <button 
                                                        onClick={() => handleEditClick(targetUser)} 
                                                        className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors"
                                                        title="Editar Técnico"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                )}
                                                {canDelete(targetUser) && (
                                                    <button 
                                                        onClick={() => handleDelete(targetUser.id)} 
                                                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                                                        title="Eliminar Usuario"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-md w-full p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#333639]">
                            <h2 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                                <LinkIcon size={16} className="text-amber-500" />
                                <span>Invitar Nuevo Usuario</span>
                            </h2>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="mt-4 space-y-4">
                            {!invitationLink ? (
                                <>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Selecciona el rol asignado para el nuevo usuario. El enlace generado expira en 2 horas y es de un solo uso.
                                    </p>
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Rol de Registro</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setInviteRole('TECH')}
                                                className={`p-3 rounded-none border transition-all flex flex-col items-center gap-1.5 ${
                                                    inviteRole === 'TECH' 
                                                        ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold' 
                                                        : 'border-slate-300 dark:border-[#333639] text-slate-400'
                                                }`}
                                            >
                                                <UserIcon size={20} className={inviteRole === 'TECH' ? 'text-amber-500' : 'text-slate-400'} />
                                                <span className="text-xs font-heading">Técnico</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setInviteRole('ADMIN')}
                                                className={`p-3 rounded-none border transition-all flex flex-col items-center gap-1.5 ${
                                                    inviteRole === 'ADMIN' 
                                                        ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold' 
                                                        : 'border-slate-300 dark:border-[#333639] text-slate-400'
                                                }`}
                                            >
                                                <Shield size={20} className={inviteRole === 'ADMIN' ? 'text-amber-500' : 'text-slate-400'} />
                                                <span className="text-xs font-heading">Administrador</span>
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleInviteUser}
                                        disabled={isSubmitting}
                                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-heading font-bold text-xs uppercase tracking-wider py-2.5 rounded-none flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                                        <span>Generar Enlace de Invitación</span>
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-3 animate-fade-in">
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-none text-emerald-400 text-xs font-medium">
                                        ¡Enlace generado exitosamente! Envíalo al técnico correspondiente:
                                    </div>
                                    <div className="relative">
                                        <input
                                            readOnly
                                            value={invitationLink}
                                            className="w-full pr-10 pl-3 py-2 bg-slate-50 dark:bg-[#141517] border border-slate-300 dark:border-[#333639] rounded-none text-slate-600 dark:text-slate-300 font-mono text-[11px] outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(invitationLink);
                                                alert('¡Enlace copiado al portapapeles!');
                                            }}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors"
                                            title="Copiar Enlace"
                                        >
                                            <LinkIcon size={14} />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setIsInviteModalOpen(false)} 
                                        className="w-full py-2 bg-slate-200 dark:bg-[#282a2d] hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-heading font-bold text-xs uppercase tracking-wider rounded-none transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] rounded-none max-w-md w-full p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#333639]">
                            <h2 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                Editar Usuario
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="mt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Apellido *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.apellido}
                                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Contraseña (Dejar en blanco para mantener)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Rol</label>
                                    <select
                                        disabled={
                                            formData.role === 'SUPER_ADMIN' ||
                                            (!isSuperAdmin && formData.role === 'ADMIN') ||
                                            (!isAdmin)
                                        }
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 disabled:opacity-50"
                                    >
                                        <option value="TECH">Técnico</option>
                                        <option value="ADMIN">Administrador</option>
                                        {formData.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Estado</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#141517] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                                    >
                                        <option value="ACTIVE">Activo</option>
                                        <option value="INACTIVE">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#333639]">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditModalOpen(false)} 
                                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-none transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="px-4 py-1.5 text-xs font-heading font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-none shadow-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Edit2 size={16} />}
                                    <span>Actualizar Usuario</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
