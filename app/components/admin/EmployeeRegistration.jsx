'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Users, Eye, EyeOff, Loader2, CheckCircle, X, Search, Edit2, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'

export default function EmployeeRegistration() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [employees, setEmployees] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

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
                                        <th className="px-6 py-4">ROLE</th>
                                        <th className="px-6 py-4">STATUS</th>
                                        <th className="px-6 py-4">CREATED</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-24 px-10 text-center">
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
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

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
