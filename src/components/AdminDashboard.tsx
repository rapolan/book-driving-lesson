import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Download, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import { getInstructorConfig } from '../utils/bookingUtils';
import '../styles/components/AdminDashboard.css';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthdate: string;
    permitNumber: string;
    instructor: string;
    date: string;
    time: string;
    timestamp: string;
    pickupLocation: string;
    guardians?: Array<{ name: string; phone: string; email: string }>;
    referralCode?: string;
    notes?: string;
    certificateNumber?: string;
    manualStatus?: 'Enrolled' | 'In Progress' | 'Ready for Cert' | 'Certified' | 'Archive';
}

const AdminDashboard: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [view, setView] = useState<'leads' | 'availability'>('leads');
    const [activeInstructor, setActiveInstructor] = useState<string>("Rob Polan");
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // Default Availability matching BookingCalendar.tsx
    const [availDraft, setAvailDraft] = useState(getInstructorConfig(activeInstructor));

    useEffect(() => {
        const storedLeads = JSON.parse(localStorage.getItem('driving_leads') || '[]');
        setLeads(storedLeads.sort((a: Lead, b: Lead) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, []);

    useEffect(() => {
        setAvailDraft(getInstructorConfig(activeInstructor));
    }, [activeInstructor]);

    const saveAvailability = () => {
        localStorage.setItem(`availability_${activeInstructor}`, JSON.stringify(availDraft));
        alert('Availability updated successfully!');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple 'school' password for demonstration
        if (password === 'School2026') {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect School Code');
        }
    };

    const updateLead = (id: string, updates: Partial<Lead>) => {
        const updatedLeads = leads.map(l => l.id === id ? { ...l, ...updates } : l);
        setLeads(updatedLeads);
        localStorage.setItem('driving_leads', JSON.stringify(updatedLeads));
    };

    const deleteLead = (id: string) => {
        if (window.confirm('Remove this lead?')) {
            const updatedLeads = leads.filter(l => l.id !== id);
            setLeads(updatedLeads);
            localStorage.setItem('driving_leads', JSON.stringify(updatedLeads));
        }
    };

    // CRM Helpers
    const getStudentLessonCount = (email: string) => {
        return leads.filter(l => l.email === email).length;
    };

    const getAutomatedStatus = (lead: Lead) => {
        if (lead.manualStatus) return lead.manualStatus;
        const count = getStudentLessonCount(lead.email);
        if (count >= 3) return 'Ready for Cert';
        if (count >= 1) return 'In Progress';
        return 'Enrolled';
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase());

        const status = getAutomatedStatus(lead);
        const matchesStatus = statusFilter === 'All' || status === statusFilter;

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
                        <input
                            type="password"
                            placeholder="School Code"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="school-input text-center h3 mb-4"
                            style={{ letterSpacing: '0.2em' }}
                        />
                        <button type="submit" className="btn btn-primary w-100 p-3 rounded-3">Enter Dashboard</button>
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
                    </div>
                </div>

                {view === 'leads' && (
                    <div className="crm-controls bg-secondary p-3 rounded-4 border border-glass mb-4 d-flex gap-3 flex-wrap">
                        <div className="flex-grow-1 position-relative">
                            <input
                                type="text"
                                placeholder="Search student name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="school-input w-100 ps-5"
                                style={{ height: '48px' }}
                            />
                            <Users size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 opacity-50" />
                        </div>
                        <select
                            className="school-input"
                            style={{ height: '48px', width: '200px' }}
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
                )}

                {view === 'leads' ? (
                    <div className="d-flex flex-column gap-3">
                        {leads.length === 0 ? (
                            <div className="admin-empty-state">
                                <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p className="text-secondary">No leads captured yet. School is quiet.</p>
                            </div>
                        ) : (
                            filteredLeads.map((lead) => {
                                const status = getAutomatedStatus(lead);
                                const lessonCount = getStudentLessonCount(lead.email);

                                return (
                                    <motion.div
                                        key={lead.id}
                                        layoutId={lead.id}
                                        className="card-layered textured textured-asphalt lead-card-crm p-2 mb-2"
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        <div className="lead-row-grid">
                                            {/* Status & Name */}
                                            <div className="d-flex align-items-center gap-2">
                                                <span className={`status-badge status-${status.toLowerCase().replace(/\s+/g, '-')} compact`}>
                                                    {status === 'Ready for Cert' ? 'Ready' : status}
                                                </span>
                                                <div className="d-flex flex-column">
                                                    <div className="lead-name-compact fw-bold">{lead.name}</div>
                                                    <div style={{ fontSize: '0.65rem' }} className="text-secondary opacity-75">
                                                        {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact & Date */}
                                            <div className="lead-meta-compact opacity-75">
                                                {lead.date} • {lead.time}
                                            </div>

                                            {/* Location & Permit */}
                                            <div className="lead-meta-compact opacity-75 truncate" title={lead.pickupLocation}>
                                                {lead.pickupLocation}
                                            </div>

                                            {/* Notes Area - Smaller and wider */}
                                            <div className="lead-notes-area">
                                                <textarea
                                                    placeholder="Add note..."
                                                    value={lead.notes || ''}
                                                    onChange={(e) => updateLead(lead.id, { notes: e.target.value })}
                                                    className="school-input-compact"
                                                />
                                            </div>

                                            {/* Management Area - Actions in row */}
                                            <div className="d-flex align-items-center gap-2">
                                                <select
                                                    className="school-input-compact select-compact"
                                                    value={lead.manualStatus || ''}
                                                    onChange={(e) => updateLead(lead.id, { manualStatus: e.target.value as any })}
                                                >
                                                    <option value="">Auto</option>
                                                    <option value="Certified">Cert</option>
                                                    <option value="Archive">Arch</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Cert #"
                                                    value={lead.certificateNumber || ''}
                                                    onChange={(e) => updateLead(lead.id, { certificateNumber: e.target.value })}
                                                    className={`school-input-compact ${status === 'Ready for Cert' ? 'border-accent' : ''}`}
                                                    style={{ width: '80px' }}
                                                />
                                            </div>

                                            {/* Delete/Email */}
                                            <div className="d-flex align-items-center gap-1">
                                                <button
                                                    className="btn-icon-compact"
                                                    onClick={() => window.open(`mailto:${lead.email}`)}
                                                    title="Email"
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                                <button
                                                    className="btn-icon-compact text-error"
                                                    onClick={() => deleteLead(lead.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
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
                                        <span className="small">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
