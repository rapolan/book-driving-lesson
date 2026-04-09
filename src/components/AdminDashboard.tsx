import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Download, Trash2, ExternalLink, ShieldCheck, Phone, Mail, MapPin, CreditCard, MessageSquare, Search, Archive } from 'lucide-react';
import { getInstructorConfig, parseLocalDate, isLessonPast } from '../utils/bookingUtils';
import { supabase } from '../lib/supabase';
import '../styles/components/AdminDashboard.css';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthdate: string;
    permit_number: string;
    instructor: string;
    date: string;
    time: string;
    timestamp: string;
    pickup_location: string;
    guardians?: Array<{ name: string; phone: string; email: string }>;
    referral_code?: string;
    notes?: string;
    certificate_number?: string;
    manual_status?: 'Enrolled' | 'In Progress' | 'Ready for Cert' | 'Certified' | 'Archive';
}

const AdminDashboard: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [view, setView] = useState<'leads' | 'availability'>('leads');
    const [activeInstructor, setActiveInstructor] = useState<string>("Rob Polan");
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');

    // Default Availability matching BookingCalendar.tsx
    const [availDraft, setAvailDraft] = useState(getInstructorConfig(activeInstructor));

    useEffect(() => {
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsAuthenticated(true);
                fetchLeads();
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            if (session) fetchLeads();
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('driving_leads')
                .select('*')
                .order('timestamp', { ascending: false });

            if (error) throw error;

            // Map Supabase snake_case to React camelCase if needed, or update interface
            setLeads(data || []);
        } catch (e) {
            console.error("Failed to load leads from Supabase:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setAvailDraft(getInstructorConfig(activeInstructor));
    }, [activeInstructor]);

    const saveAvailability = () => {
        localStorage.setItem(`availability_${activeInstructor}`, JSON.stringify(availDraft));
        alert('Availability updated successfully!');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: password,
            });

            if (error) throw error;
            setIsAuthenticated(true);
        } catch (error: any) {
            alert(error.message || 'Error logging in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
    };

    const updateLead = async (id: string, updates: Partial<Lead>) => {
        try {
            const { error } = await supabase
                .from('driving_leads')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            setLeads(leads.map(l => l.id === id ? { ...l, ...updates } : l));
        } catch (e) {
            alert('Failed to update lead');
            console.error(e);
        }
    };

    const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirmDeleteId === id) {
            try {
                const { error } = await supabase
                    .from('driving_leads')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                setLeads(leads.filter(l => l.id !== id));
                setConfirmDeleteId(null);
            } catch (e) {
                alert('Failed to delete lead');
                console.error(e);
            }
        } else {
            setConfirmDeleteId(id);
            setTimeout(() => {
                setConfirmDeleteId(current => current === id ? null : current);
            }, 3000);
        }
    };

    // CRM Helpers
    const getStudentLessonCount = (email: string) => {
        return leads.filter(l => l.email === email && isLessonPast(l.date, l.time)).length;
    };

    const getAutomatedStatus = (lead: Lead) => {
        if (lead.manual_status) return lead.manual_status;
        const count = getStudentLessonCount(lead.email);
        if (count >= 3) return 'Ready for Cert';
        if (count >= 1) return 'In Progress';
        return 'Enrolled';
    };

    const filteredLeads = leads.filter(lead => {
        const name = lead.name || "";
        const email = lead.email || "";

        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());

        const status = getAutomatedStatus(lead);
        const matchesStatus = statusFilter === 'All' 
            ? status !== 'Archive' 
            : status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const exportLeads = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "driving_leads_school.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass card-layered admin-login-card"
                >
                    <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                    <h2 className="h2" style={{ marginBottom: '1rem' }}>Instructor Access</h2>
                    <p className="small text-secondary" style={{ marginBottom: '2rem' }}>Enter the school Access Code to view your leads.</p>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <input
                                type="email"
                                placeholder="Email address"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="school-input w-100 mb-2"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Access Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="school-input w-100"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 p-3 rounded-3"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : 'Access CRM'}
                        </button>
                    </form>

                </motion.div>
            </div>
        );
    }

    return (
        <div className="section container dashboard-page-section page-top-padding">
            <div className="dashboard-narrow">
                <div className="dashboard-header d-flex justify-content-between align-items-center flex-wrap gap-4 mb-4">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <ShieldCheck size={20} className="text-primary" />
                            <span className="text-secondary small fw-bold text-uppercase opacity-75">Instructor Control Center</span>
                        </div>
                        <h1 className="display-small m-0">Admin School</h1>
                    </div>
                    <div className="d-flex gap-3">
                        <button
                            className={`btn ${view === 'leads' ? 'btn-primary' : 'btn-outline'} p-3 px-4`}
                            onClick={() => setView('leads')}
                        >
                            <Users size={18} className="me-2" /> Leads
                        </button>
                        <button
                            className={`btn ${view === 'availability' ? 'btn-primary' : 'btn-outline'} p-3 px-4`}
                            onClick={() => setView('availability')}
                        >
                            <Calendar size={18} className="me-2" /> Availability
                        </button>
                        <button onClick={exportLeads} className="btn-circle" style={{ width: '48px', height: '48px' }} title="Export CSV">
                            <Download size={18} />
                        </button>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm px-3" style={{ height: '48px' }}>Sign Out</button>
                    </div>
                </div>

                {view === 'leads' && (
                    <div className="crm-controls mb-4 d-flex gap-3 flex-wrap align-items-center">
                        <div className="flex-grow-1 position-relative" style={{ minWidth: '250px' }}>
                            <input
                                type="text"
                                placeholder="Search student name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="school-input w-100 search-input-with-icon"
                                style={{ height: '48px' }}
                            />
                            <Search size={18} className="search-bar-icon" />
                        </div>
                        <div className="d-flex gap-3 flex-grow-1 flex-md-grow-0">
                            <select
                                className="school-input flex-grow-1"
                                style={{ height: '48px', width: '200px', minWidth: '160px' }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Enrolled">Enrolled</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Ready for Cert">Ready for Cert</option>
                                <option value="Certified">Certified</option>
                                <option value="Archive">Archive</option>
                            </select>
                        </div>
                    </div>
                )}

                {view === 'leads' ? (
                    <div className="d-flex flex-column gap-3">
                        {leads.length === 0 ? (
                            <div className="admin-empty-state">
                                <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p className="text-secondary">No leads captured yet. School is quiet.</p>
                            </div>
                        ) : (
                            filteredLeads.filter(lead => lead && lead.id).map((lead) => {
                                const status = getAutomatedStatus(lead);
                                const lessonCount = lead.email ? getStudentLessonCount(lead.email) : 0;

                                return (
                                    <motion.div
                                        key={lead.id}
                                        layoutId={lead.id}
                                        className="card-layered glass-card lead-card-crm p-3 mb-3"
                                    >
                                        <div className="lead-card-layout">
                                            {/* Column 1: Identity & Status */}
                                            <div className="lead-col-identity">
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <span className={`status-badge status-${status.toLowerCase().replace(/\s+/g, '-')} compact`}>
                                                        {status === 'Ready for Cert' ? 'Ready' : status}
                                                    </span>
                                                    <div className="lesson-count-pill">
                                                        {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                                                    </div>
                                                </div>
                                                <div className="lead-name-premium">{lead.name}</div>
                                                <div className="lead-id-subtle">ID: {lead.id?.slice(0, 8) || 'Unknown'}</div>
                                            </div>

                                            {/* Column 2: Contact & Logistics */}
                                            <div className="lead-col-details">
                                                <div className="details-group">
                                                    <div className="detail-item">
                                                        <Phone size={16} className="text-primary opacity-100" />
                                                        <span>{lead.phone}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <Mail size={16} className="text-primary opacity-100" />
                                                        <span>{lead.email}</span>
                                                    </div>
                                                </div>
                                                <div className="details-group">
                                                    <div className="detail-item fw-bold text-white">
                                                        <Calendar size={16} className="opacity-100" />
                                                        <span>{lead.date} • {lead.time}</span>
                                                    </div>
                                                    <div className="detail-item opacity-100">
                                                        <MapPin size={16} />
                                                        <span>{lead.pickup_location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 3: Management & Notes */}
                                            <div className="lead-col-management">
                                                <div className="management-top-row">
                                                    <div className="input-group-compact">
                                                        <CreditCard size={16} className="opacity-75" />
                                                        <input
                                                            type="text"
                                                            placeholder="Cert #"
                                                            value={lead.certificate_number || ''}
                                                            onChange={(e) => updateLead(lead.id, { certificate_number: e.target.value })}
                                                            className={`school-input-compact input-cert-no ${status === 'Ready for Cert' ? 'border-accent' : ''}`}
                                                        />
                                                    </div>
                                                    <select
                                                        className="school-input-compact select-compact override-status-select"
                                                        value={lead.manual_status || ''}
                                                        onChange={(e) => updateLead(lead.id, { manual_status: e.target.value as any })}
                                                        title="Override Status"
                                                    >
                                                        <option value="">Smart (Auto)</option>
                                                        <option value="Certified">Certified</option>
                                                        <option value="Archive">Archive</option>
                                                    </select>
                                                </div>
                                                <div className="notes-container-compact">
                                                    <MessageSquare size={16} className="notes-icon opacity-75" />
                                                    <textarea
                                                        placeholder="Quick note..."
                                                        value={lead.notes || ''}
                                                        onChange={(e) => updateLead(lead.id, { notes: e.target.value })}
                                                        className="school-input-compact notes-input"
                                                    />
                                                </div>
                                            </div>

                                            {/* Column 4: Actions (Fixed on right) */}
                                            <div className="lead-col-actions">
                                                <button
                                                    className="btn-icon-premium"
                                                    onClick={() => window.open(`mailto:${lead.email}`)}
                                                    title="Email Student"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                                <button
                                                    className={`btn-icon-premium ${status === 'Archive' ? 'btn-archive-active' : ''}`}
                                                    onClick={() => updateLead(lead.id, { manual_status: status === 'Archive' ? 'Enrolled' : 'Archive' })}
                                                    title={status === 'Archive' ? "Unarchive Student" : "Archive Student"}
                                                >
                                                    <Archive size={16} fill={status === 'Archive' ? "currentColor" : "none"} />
                                                </button>
                                                <button
                                                    className={`btn-icon-premium ${confirmDeleteId === lead.id ? 'confirm-delete-active' : 'text-error'}`}
                                                    onClick={(e) => handleDeleteClick(lead.id, e)}
                                                    title={confirmDeleteId === lead.id ? "Click again to confirm PERMANENT DELETE" : "Delete Lead Permanently"}
                                                >
                                                    {confirmDeleteId === lead.id ? <Trash2 size={16} fill="white" /> : <Trash2 size={16} />}
                                                    {confirmDeleteId === lead.id && <span className="ms-1 tiny fw-bold">Delete?</span>}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <div className="card-layered textured p-5">
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <div>
                                <h2 className="h2 mb-1">Working Hours & Availability</h2>
                                <p className="text-secondary m-0">Manage your weekly schedule for 2-hour lesson blocks.</p>
                            </div>
                            <div className="d-flex gap-2 bg-secondary p-1 rounded-3">
                                {["Rob Polan", "Natalie Polan"].map(name => (
                                    <motion.button
                                        key={name}
                                        onClick={() => setActiveInstructor(name)}
                                        className={`btn ${activeInstructor === name ? 'btn-primary' : ''} p-2 px-3 rounded-2 fw-bold`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {name.split(' ')[0]}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="textured-asphalt mb-5 p-4 bg-secondary rounded-3 border border-glass position-relative overflow-hidden">
                            <h3 className="h5 mb-1 position-relative" style={{ zIndex: 2 }}>Google Calendar Sync (Bridge)</h3>
                            <p className="text-secondary small mb-3 position-relative" style={{ zIndex: 2 }}>Paste your Google Apps Script URL here to enable two-way sync.</p>
                            <input
                                type="text"
                                className="school-input"
                                placeholder="https://script.google.com/macros/s/.../exec"
                                value={availDraft.googleScriptUrl || ''}
                                onChange={(e) => setAvailDraft({ ...availDraft, googleScriptUrl: e.target.value })}
                            />
                        </div>

                        <div style={{ maxWidth: '800px' }}>
                            {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
                                const config = availDraft.days[day as keyof typeof availDraft.days];

                                return (
                                    <div key={day} className="grid grid-3-cols align-items-center gap-4 py-3 border-bottom border-glass">
                                        <div className="fw-bold h5 mb-0">{dayName}</div>
                                        <div>
                                            <button
                                                onClick={() => setAvailDraft({
                                                    ...availDraft,
                                                    days: { ...availDraft.days, [day]: { ...config, enabled: !config.enabled } }
                                                })}
                                                className={`availability-toggle ${config.enabled ? 'enabled' : 'disabled'}`}
                                            >
                                                <div className="availability-toggle-knob" />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: config.enabled ? 1 : 0.3, pointerEvents: config.enabled ? 'auto' : 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className="small text-secondary">Start:</span>
                                                <input
                                                    type="time"
                                                    value={config.start}
                                                    onChange={(e) => setAvailDraft({
                                                        ...availDraft,
                                                        days: { ...availDraft.days, [day]: { ...config, start: e.target.value } }
                                                    })}
                                                    className="availability-time-input"
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className="small text-secondary">End:</span>
                                                <input
                                                    type="time"
                                                    value={config.end}
                                                    onChange={(e) => setAvailDraft({
                                                        ...availDraft,
                                                        days: { ...availDraft.days, [day]: { ...config, end: e.target.value } }
                                                    })}
                                                    className="availability-time-input"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                            <h3 className="h3" style={{ marginBottom: '1rem' }}>Blocked Dates (Vacations & Holidays)</h3>
                            <p className="small text-secondary" style={{ marginBottom: '1.5rem' }}>Select specific dates where you are completely unavailable.</p>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <input
                                    type="date"
                                    id="blockDateInput"
                                    className="availability-time-input"
                                    style={{ padding: '0.75rem' }}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        const input = document.getElementById('blockDateInput') as HTMLInputElement;
                                        if (input.value && !availDraft.excludedDates.includes(input.value)) {
                                            setAvailDraft({
                                                ...availDraft,
                                                excludedDates: [...availDraft.excludedDates, input.value].sort()
                                            });
                                            input.value = '';
                                        }
                                    }}
                                    style={{ padding: '0.75rem 1.5rem' }}
                                >
                                    Block Date
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {availDraft.excludedDates.length === 0 && <p className="small text-secondary italic">No dates blocked.</p>}
                                {availDraft.excludedDates.map((date: string) => (
                                    <div key={date} className="blocked-date-badge">
                                        <span className="small">{parseLocalDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        <button
                                            onClick={() => setAvailDraft({
                                                ...availDraft,
                                                excludedDates: availDraft.excludedDates.filter((d: string) => d !== date)
                                            })}
                                            className="btn-remove-blocked"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                            <h3 className="h3" style={{ marginBottom: '1rem' }}>Google Calendar Integration</h3>
                            <p className="small text-secondary" style={{ marginBottom: '1.5rem' }}>
                                Paste your deployed Google Apps Script URL here to sync availability and push new bookings.
                                <br />
                                <span className="small italic text-secondary" style={{ fontSize: '0.8rem' }}>
                                    Need help? Check the <a href="#" onClick={(e) => { e.preventDefault(); alert('Refer to google_apps_script_instructions.md in your brain folder.'); }} style={{ color: 'var(--primary)' }}>Setup Guide</a>.
                                </span>
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="https://script.google.com/macros/s/.../exec"
                                    value={availDraft.googleScriptUrl}
                                    onChange={(e) => setAvailDraft({ ...availDraft, googleScriptUrl: e.target.value })}
                                    className="small"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--glass-border)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-top border-glass d-flex justify-content-end">
                            <button
                                className="btn btn-primary p-3 px-5 rounded-3"
                                onClick={saveAvailability}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
