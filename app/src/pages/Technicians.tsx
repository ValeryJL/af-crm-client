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
            setError(err.response?.data?.message || 'Failed to connect to the server.');
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
            alert(err.response?.data || 'Failed to update user.');
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
            alert('Failed to generate invitation.');
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
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await apiClient.delete(`/users/${id}`);
            fetchUsers();
        } catch (err: any) {
            console.error('Failed to delete user', err);
            alert(err.response?.data || 'Failed to delete user.');
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
        <div className="space-y-6">
            <div className="flex justify-between items-center whitespace-nowrap mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Users</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage directory and permissions</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => {
                            setInvitationLink(null);
                            setIsInviteModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5">
                        <LinkIcon size={20} />
                        <span>Invite User</span>
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                            <p>Loading directory...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-12 text-rose-500">
                            <AlertCircle size={32} className="mb-2 opacity-50" />
                            <p className="font-medium text-center">{error}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                                <Plus size={24} className="text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-600 text-lg">No users found.</p>
                            <p className="text-sm mt-1">Invite a new user to get started.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                                    <th className="p-4 pl-6">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4 text-center">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredUsers.map((targetUser) => (
                                    <tr key={targetUser.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/50 dark:to-blue-900/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                                                    {(targetUser.nombre?.charAt(0) || '') + (targetUser.apellido?.charAt(0) || '')}
                                                </div>
                                                <div className="font-semibold text-slate-800 dark:text-slate-100">{targetUser.nombre} {targetUser.apellido}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{targetUser.email || '-'}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${targetUser.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                targetUser.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {targetUser.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${(!targetUser.status || targetUser.status === 'ACTIVE') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {targetUser.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            {canEdit(targetUser) && (
                                                <button onClick={() => handleEditClick(targetUser)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                            )}
                                            {canDelete(targetUser) && (
                                                <button onClick={() => handleDelete(targetUser.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <LinkIcon size={20} className="text-indigo-500" />
                                Invite New User
                            </h2>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {!invitationLink ? (
                                <>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Select the role for the new user. The generated link will expire in 2 hours and can only be used once.</p>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Registration Role</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setInviteRole('TECH')}
                                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${inviteRole === 'TECH' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-700'}`}
                                            >
                                                <UserIcon size={24} className={inviteRole === 'TECH' ? 'text-indigo-600' : 'text-slate-400'} />
                                                <span className="font-bold">Technician</span>
                                            </button>
                                            <button
                                                onClick={() => setInviteRole('ADMIN')}
                                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${inviteRole === 'ADMIN' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-700'}`}
                                            >
                                                <Shield size={24} className={inviteRole === 'ADMIN' ? 'text-indigo-600' : 'text-slate-400'} />
                                                <span className="font-bold">Administrator</span>
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleInviteUser}
                                        disabled={isSubmitting}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <LinkIcon size={20} />}
                                        Generate Invitation Link
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                                        Invitation link generated successfully! Send this URL to the user.
                                    </div>
                                    <div className="relative group">
                                        <input
                                            readOnly
                                            value={invitationLink}
                                            className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-mono text-xs outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(invitationLink);
                                                alert('Copied to clipboard!');
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <LinkIcon size={16} />
                                        </button>
                                    </div>
                                    <button onClick={() => setIsInviteModalOpen(false)} className="w-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl">
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit User</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-700 p-1 rounded-full shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.apellido}
                                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password (Leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                    <select
                                        disabled={
                                            formData.role === 'SUPER_ADMIN' ||
                                            (!isSuperAdmin && formData.role === 'ADMIN') ||
                                            (!isAdmin)
                                        }
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-50"
                                    >
                                        <option value="TECH">Technician</option>
                                        <option value="ADMIN">Administrator</option>
                                        {formData.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-indigo-200">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Edit2 size={18} />}
                                    <span>Update User</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
