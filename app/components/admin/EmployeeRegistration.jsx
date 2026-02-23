'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { UserPlus, Users, Eye, EyeOff, Loader2, CheckCircle, X, Search, KeyRound, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'

export default function EmployeeRegistration() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [employees, setEmployees] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [resetModal, setResetModal] = useState(null)
    const [resetPassword, setResetPassword] = useState('')
    const [resetRevealed, setResetRevealed] = useState(null)
    const [resetLoading, setResetLoading] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const { user: reduxUser } = useSelector((state) => state.auth || {})
    const currentUser = useMemo(() => {
        if (reduxUser?.role) return reduxUser
        try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null
            return stored ? JSON.parse(stored) : null
        } catch {
            return null
        }
    }, [reduxUser])

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        staffCode: ''
    })

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            const result = await api.getUsers()
            const data = result?.data || result
            setEmployees(data || [])
        } catch (err) {
            console.error('Error fetching employees:', err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.username || !formData.password || !formData.staffCode) {
            setError('Please fill in all required fields')
            return
        }

        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            await api.registerEmployee(
                formData.username,
                formData.password,
                formData.staffCode,
                'ADMIN' // Always register as ADMIN
            )

            setSuccess('Employee registered successfully!')
            setFormData({
                username: '',
                password: '',
                staffCode: ''
            })

            // Refresh employee list
            await fetchEmployees()

            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            console.error('Error registering employee:', err)
            setError(err.message || 'Failed to register employee')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredEmployees = employees
        .filter(emp => emp.role === 'ADMIN' || emp.role === 'SUPER_ADMIN')
        .filter(emp =>
            emp.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.staffCode?.toLowerCase().includes(searchTerm.toLowerCase())
        )

    const handleResetPassword = async () => {
        if (!resetModal || !resetPassword.trim()) return
        setResetLoading(true)
        setError('')
        try {
            const res = await api.resetEmployeePassword(resetModal.id, resetPassword.trim())
            setResetRevealed({ password: res.password, username: res.username })
            setResetPassword('')
        } catch (err) {
            setError(err?.message || 'Failed to reset password')
        } finally {
            setResetLoading(false)
        }
    }

    const handleDeletePermanently = async () => {
        if (!deleteConfirm) return
        setDeleteLoading(true)
        setError('')
        try {
            await api.deleteUserPermanently(deleteConfirm.id)
            setSuccess('Employee deleted permanently')
            setDeleteConfirm(null)
            await fetchEmployees()
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(err?.message || 'Failed to delete employee')
        } finally {
            setDeleteLoading(false)
        }
    }

    const closeResetModal = () => {
        setResetModal(null)
        setResetPassword('')
        setResetRevealed(null)
        setError('')
    }

    return (
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">

                <div className="h-8 w-[2px] bg-gray-200"></div>
                <div>
                    <h2 className="text-sm font-black text-sky-600 uppercase tracking-widest">Admin</h2>
                    <h1 className="text-2xl font-black text-gray-900">Employee Registration</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Registration Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 p-8 border border-gray-100">
                        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-sky-600" />
                            REGISTER NEW EMPLOYEE
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                    placeholder="e.g. john.doe"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="Enter password"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                    Staff Code *
                                </label>
                                <input
                                    type="text"
                                    value={formData.staffCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, staffCode: e.target.value }))}
                                    placeholder="e.g. EMP001"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-black text-sm uppercase tracking-widest shadow-lg shadow-sky-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        REGISTERING...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        REGISTER EMPLOYEE
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Employee List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 tracking-tight">REGISTERED EMPLOYEES</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Total: {employees.length}</p>
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by username or staff code..."
                                    className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/80 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">SR</th>
                                        <th className="px-6 py-4">USERNAME</th>
                                        <th className="px-6 py-4">STAFF CODE</th>
                                        {isSuperAdmin && <th className="px-6 py-4">PASSWORD</th>}
                                        <th className="px-6 py-4">ROLE</th>
                                        <th className="px-6 py-4">STATUS</th>
                                        <th className="px-6 py-4">CREATED</th>
                                        {isSuperAdmin && <th className="px-6 py-4">ACTIONS</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan={isSuperAdmin ? 8 : 6} className="py-24 px-10 text-center">
                                                <Users className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">
                                                    {searchTerm ? 'No employees found' : 'No employees registered'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployees.map((employee, idx) => (
                                            <tr key={employee.id} className="hover:bg-sky-50/50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-black text-gray-400">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-black text-sky-700">{employee.username}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                                    {employee.staffCode || 'N/A'}
                                                </td>
                                                {isSuperAdmin && (
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-400 text-xs">••••••••</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setResetModal(employee)}
                                                            className="ml-2 px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded hover:bg-sky-200 font-bold flex items-center gap-1 inline-flex"
                                                        >
                                                            <KeyRound className="w-3 h-3" />
                                                            Reset
                                                        </button>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${employee.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700' :
                                                        employee.role === 'ADMIN' ? 'bg-sky-50 text-sky-700' :
                                                            'bg-gray-50 text-gray-700'
                                                        }`}>
                                                        {employee.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${employee.isActive
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-red-50 text-red-700'
                                                        }`}>
                                                        {employee.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-600">
                                                    {new Date(employee.createdAt).toLocaleDateString()}
                                                </td>
                                                {isSuperAdmin && (
                                                    <td className="px-6 py-4">
                                                        {employee.role === 'ADMIN' && employee.id !== currentUser?.id && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeleteConfirm(employee)}
                                                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-bold flex items-center gap-1"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reset Password Modal */}
            {resetModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-black text-gray-900">Reset Password</h3>
                            <button onClick={closeResetModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {resetRevealed ? (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    New password for <strong>{resetRevealed.username}</strong>:
                                </p>
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-black text-emerald-800 break-all">
                                    {resetRevealed.password}
                                </div>
                                <p className="text-xs text-amber-600">Save this password. It cannot be shown again.</p>
                                <button
                                    onClick={closeResetModal}
                                    className="w-full py-3 bg-sky-600 text-white rounded-xl font-black"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600 mb-4">Set new password for {resetModal.username}</p>
                                <input
                                    type="text"
                                    value={resetPassword}
                                    onChange={(e) => setResetPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={closeResetModal}
                                        className="flex-1 py-3 border border-gray-200 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={!resetPassword.trim() || resetLoading}
                                        className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-black disabled:opacity-50"
                                    >
                                        {resetLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Reset'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-black text-gray-900 mb-2">Permanently Delete Employee</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This will permanently delete <strong>{deleteConfirm.username}</strong>. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePermanently}
                                disabled={deleteLoading}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black disabled:opacity-50"
                            >
                                {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alerts */}
            {(error || success) && (
                <div className={`fixed bottom-8 right-8 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${error ? 'bg-white text-red-600 border-red-100' : 'bg-white text-emerald-600 border-emerald-100'
                    }`}>
                    <div className={`p-2 rounded-full ${error ? 'bg-red-50' : 'bg-emerald-50'}`}>
                        {error ? <X className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </div>
                    <p className="font-black text-sm uppercase tracking-tight pr-4">{error || success}</p>
                    <button onClick={() => { setError(''); setSuccess(''); }} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
                </div>
            )}
        </div>
    )
}
