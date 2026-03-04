import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, User, Loader2, Sparkles, BookOpen, Clock, ChevronLeft, ChevronRight, CheckCircle, GraduationCap, ListTodo, AlertCircle, Check, Lock, X, LogOut } from 'lucide-react';
import emailjs from '@emailjs/browser';
import curriculumData from '../data/curriculum.json';
import '../styles/components/StudentPortal.css';
import {
    instructors,
    getInstructorConfig,
    generateTimeSlots,
    isMinor,
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    EMAILJS_MAGIC_LINK_TEMPLATE_ID,
    EMAILJS_PUBLIC_KEY,
    toLocalISOString,
    parseLocalDate,
    type PaymentMethod,
    PAYMENT_METHODS
} from '../utils/bookingUtils';


interface SessionData {
    email: string;
    token: string;
    expires: number;
}

const StudentPortal: React.FC = () => {
    const [loginEmail, setLoginEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [session, setSession] = useState<SessionData | null>(null);
    const hasValidatedMagicLink = React.useRef(false);
    const [studentLeads, setStudentLeads] = useState<any[]>([]);
    const [view, setView] = useState<'overview' | 'book'>('overview');

    // Quick Book State
    const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [bookingStep, setBookingStep] = useState(0); // 0: Instructor, 1: Selection, 2: Pickup, 3: Success
    const [pickupLocation, setPickupLocation] = useState('');

    // New local state for split address fields
    const [pickupType, setPickupType] = useState<'address' | 'school'>('address');
    const [pickupAddress, setPickupAddress] = useState({ street: '', city: '', zip: '', schoolName: '' });

    // Sync pickupAddress to pickupLocation string
    useEffect(() => {
        const { street, city, zip, schoolName } = pickupAddress;

        if (pickupType === 'address') {
            if (street || city || zip) {
                setPickupLocation(`${street}, ${city} ${zip} `);
            }
        } else {
            if (schoolName) {
                setPickupLocation(schoolName);
            }
        }
    }, [pickupAddress, pickupType]);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [busySlots, setBusySlots] = useState<{ [instructor: string]: { [date: string]: string[] } }>({});
    const [googleBusySlots, setGoogleBusySlots] = useState<{ [date: string]: { start: string, end: string }[] }>({});
    const [isSyncing, setIsSyncing] = useState(false);
    const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
    const [selectedDayModal, setSelectedDayModal] = useState<number | null>(null);
    const [expandedResource, setExpandedResource] = useState<string | null>(null);

    useEffect(() => {
        if (hasValidatedMagicLink.current) return;

        // 1. Check for token in URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');

        if (token && email) {
            hasValidatedMagicLink.current = true;
            validateMagicLink(email, token);
            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // 2. Check for existing session in localStorage
            const storedSession = localStorage.getItem('school_student_session');
            if (storedSession) {
                const parsed = JSON.parse(storedSession);
                if (Date.now() < parsed.expires) {
                    setSession(parsed);
                    loadStudentData(parsed.email);
                } else {
                    localStorage.removeItem('school_student_session');
                }
            }
        }
    }, []);

    useEffect(() => {
        const localLeads = JSON.parse(localStorage.getItem('driving_leads') || '[]');
        const busy: { [instructor: string]: { [date: string]: string[] } } = {
            "Rob Polan": {},
            "Natalie Polan": {}
        };

        localLeads.forEach((lead: any) => {
            const instr = lead.instructor || "Rob Polan";
            if (!busy[instr]) busy[instr] = {};
            if (!busy[instr][lead.date]) busy[instr][lead.date] = [];
            busy[instr][lead.date].push(lead.time);
        });

        setBusySlots(busy);
    }, [view]);

    useEffect(() => {
        if (selectedDate && selectedInstructor) {
            fetchGoogleAvailability(new Date(selectedDate));
        }
    }, [selectedDate, selectedInstructor]);

    const fetchGoogleAvailability = async (date: Date) => {
        if (!selectedInstructor) return;
        const config = getInstructorConfig(selectedInstructor);
        if (!config?.googleScriptUrl) {
            setGoogleBusySlots({});
            return;
        }

        setIsSyncing(true);
        const dateStr = toLocalISOString(date);
        try {
            const response = await fetch(`${config.googleScriptUrl}?date = ${dateStr} `);
            const data = await response.json();
            setGoogleBusySlots(prev => ({ ...prev, [dateStr]: data }));
        } catch (error) {
            console.error("Failed to sync with Google Calendar:", error);
            setGoogleBusySlots({});
        } finally {
            setIsSyncing(false);
        }
    };

    const validateMagicLink = (email: string, token: string) => {
        const emailToUse = email.trim();
        const storedToken = localStorage.getItem(`magic_token_${emailToUse}`);

        console.log("Validating Magic Link:", {
            providedEmail: email,
            trimmedEmail: emailToUse,
            providedToken: token,
            storedToken: storedToken,
            match: storedToken === token
        });

        if (storedToken === token) {
            const newSession = {
                email,
                token,
                expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
            };
            setSession(newSession);
            localStorage.setItem('school_student_session', JSON.stringify(newSession));
            loadStudentData(email);
            localStorage.removeItem(`magic_token_${email}`);
        } else {
            setMessage({ type: 'error', text: 'Invalid or expired magic link.' });
        }
    };

    const loadStudentData = (email: string) => {
        const allLeads = JSON.parse(localStorage.getItem('driving_leads') || '[]');
        const filtered = allLeads.filter((l: any) =>
            l.email === email || l.guardians?.some((g: any) => g.email === email)
        );
        const sorted = filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setStudentLeads(sorted);
        if (sorted.length > 0) {
            const loc = sorted[0].pickupLocation || '';
            setPickupLocation(loc);

            // Try to parse existing location
            const parts = loc.split(',').map((p: string) => p.trim());
            if (parts.length >= 2) {
                // Determine if it's an address (has numbers) or school (just names)
                const hasNumbers = /\d/.test(parts[0]);

                if (hasNumbers) {
                    // It&apos;s likely an address. Let's capture the street, and everything else is city/zip
                    const street = parts[0];
                    const remaining = parts.slice(1).join(', ').trim();
                    const lastSpaceIndex = remaining.lastIndexOf(' ');

                    const zip = lastSpaceIndex !== -1 ? remaining.substring(lastSpaceIndex).trim() : '';
                    const city = lastSpaceIndex !== -1 ? remaining.substring(0, lastSpaceIndex).trim() : remaining;

                    setPickupType('address');
                    setPickupAddress({ street, city, zip, schoolName: '' });
                } else {
                    // It&apos;s likely a school
                    setPickupType('school');
                    setPickupAddress({ street: '', city: parts.slice(1).join(', '), zip: '', schoolName: parts[0] });
                }
            } else if (loc) {
                // Fallback for single line
                setPickupType('address');
                setPickupAddress({ street: loc, city: '', zip: '', schoolName: '' });
            }
        }
    };

    const handleRequestLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setMessage(null);

        const emailToUse = loginEmail.trim();

        // Check if student exists (by student email or guardian email)
        const allLeads = JSON.parse(localStorage.getItem('driving_leads') || '[]');
        const exists = allLeads.some((l: any) =>
            l.email?.trim() === emailToUse || l.guardians?.some((g: any) => g.email?.trim() === emailToUse)
        );

        if (!exists) {
            setMessage({ type: 'error', text: 'No record found with this email. Please book a lesson first!' });
            setIsSending(false);
            return;
        }

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(`magic_token_${emailToUse}`, token);

        const magicLink = `${window.location.origin}${window.location.pathname}?token=${token}&email=${emailToUse}`;

        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_MAGIC_LINK_TEMPLATE_ID,
                {
                    to_email: emailToUse,
                    magic_link: magicLink,
                },
                EMAILJS_PUBLIC_KEY
            );
            setMessage({ type: 'success', text: 'Magic link sent! Check your inbox to login.' });
        } catch (error: any) {
            console.error("Magic link failed:", error);
            const errorMsg = error?.text || error?.message || JSON.stringify(error) || "Unknown Error";

            setMessage({
                type: 'success',
                text: `Email service (EmailJS) error: ${errorMsg}\n\nPlease use this direct link to login: \n\n${magicLink}`
            });
        } finally {
            setIsSending(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('school_student_session');
        setSession(null);
        setStudentLeads([]);
        setView('overview');
    };

    const handleSubmit = async () => {
        if (!selectedInstructor || !selectedDate || !selectedTime || !session) return;

        if (!paymentMethod) {
            alert("Please select a payment method (Zelle, Venmo, or Cash) to proceed.");
            return;
        }

        const latestLead = studentLeads[0];

        const appointment = {
            id: Math.random().toString(36).substr(2, 9),
            ...latestLead,
            instructor: selectedInstructor,
            date: selectedDate,
            time: selectedTime,
            pickupLocation: pickupLocation,
            timestamp: new Date().toISOString()
        };

        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    from_name: appointment.name,
                    from_email: appointment.email,
                    phone: appointment.phone,
                    birthdate: appointment.birthdate,
                    permit_number: appointment.permitNumber,
                    instructor_name: selectedInstructor,
                    instructor_email: instructors.find(i => i.name === selectedInstructor)?.email,
                    pickup_location: pickupLocation,
                    appointment_date: selectedDate,
                    appointment_time: selectedTime,
                    payment_method: paymentMethod,
                    guardians: isMinor(appointment.birthdate) ? appointment.guardians.map((g: any) => `${g.name} (${g.phone}, ${g.email})`).join(', ') : 'N/A'
                },
                EMAILJS_PUBLIC_KEY
            );

            const config = getInstructorConfig(selectedInstructor);
            if (config?.googleScriptUrl) {
                const start = new Date(`${selectedDate} ${selectedTime} `);
                const end = new Date(start.getTime() + (2 * 60 * 60 * 1000));

                await fetch(config.googleScriptUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify({
                        studentName: appointment.name,
                        studentEmail: appointment.email,
                        studentPhone: appointment.phone,
                        pickupLocation: pickupLocation,
                        paymentMethod: paymentMethod,
                        permit: appointment.permitNumber,
                        guardians: appointment.guardians ? appointment.guardians.map((g: any) => `${g.name} - ${g.phone} (${g.email})`).join('; ') : 'N/A',
                        startTime: start.toISOString(),
                        endTime: end.toISOString()
                    })
                });
            }

            const allLeads = JSON.parse(localStorage.getItem('driving_leads') || '[]');
            localStorage.setItem('driving_leads', JSON.stringify([...allLeads, appointment]));

            setBookingStep(3);
            loadStudentData(session.email);
        } catch (error) {
            console.error("Booking failed:", error);
            alert("Failed to book lesson. Please try again or contact us.");
        }
    };

    const getDaysInMonth = (month: Date) => {
        const year = month.getFullYear();
        const m = month.getMonth();
        const firstDay = new Date(year, m, 1).getDay();
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, m, i));
        return days;
    };

    if (!session) {
        return (
            <div className="section container portal-login-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-layered textured portal-login-card"
                >
                    <div className="text-center mb-5">
                        <div className="success-icon-container">
                            <GraduationCap size={32} />
                        </div>
                        <h2 className="h2 mb-2">Student Portal</h2>
                        <p className="text-secondary small">Enter your email to receive a secure login link.</p>
                    </div>

                    <form onSubmit={handleRequestLink}>
                        <div className="mb-4">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="name@example.com"
                                required
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                        </div>

                        {message && (
                            <div
                                className={`p-3 rounded-3 mb-4 small message-alert-box ${message.type === 'success' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} `}
                            >
                                {message.text}
                            </div>
                        )}

                        <button
                            disabled={isSending}
                            className="btn btn-primary w-100 p-3 rounded-3"
                        >
                            {isSending ? <Loader2 size={18} className="animate-spin" /> : 'Request Magic Link'}
                            {!isSending && <ArrowRight size={18} className="ms-2" />}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    const nextLesson = studentLeads.find(l => new Date(l.date).getTime() >= new Date().setHours(0, 0, 0, 0));

    return (
        <div className="section container portal-page-container dashboard-page-section">
            <div className="dashboard-narrow">
                {/* High-Fidelity Header Area */}
                <div className="portal-header text-start">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="portal-badge">
                                    Student Portal
                                </span>
                            </div>
                            <h1 className="h1 mb-1">Welcome Back 👋</h1>
                            <p className="text-secondary m-0">
                                {studentLeads.length > 0 && studentLeads[0].email !== session.email
                                    ? `Guardian Portal • Managing: ${[...new Set(studentLeads.map(l => l.name))].join(', ')} `
                                    : `${studentLeads.length > 0 ? studentLeads[0].name : 'Student'} • ${session.email} `}
                            </p>
                        </div>
                        <div className="portal-header-actions d-flex gap-3">
                            <button
                                onClick={() => {
                                    setView(view === 'overview' ? 'book' : 'overview');
                                    setBookingStep(0);
                                }}
                                className="btn btn-primary d-flex align-items-center justify-content-center gap-2 p-3 rounded-3 flex-grow-1"
                            >
                                {view === 'overview' ? (
                                    <>
                                        <Calendar size={18} /> Book New Lesson
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight size={18} className="rotate-180" /> Back to Dashboard
                                    </>
                                )}
                            </button>
                            <button onClick={logout} className="btn-circle btn-icon-lg flex-shrink-0" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {view === 'overview' ? (
                    <>
                        {/* Status Dashboard Grid */}
                        <div className="grid grid-3 gap-3 gap-md-4 mb-5">
                            <div className="stat-card-modern">
                                <div className="icon-box-primary icon-box-lg mb-2">
                                    <Calendar size={24} />
                                </div>
                                <div className="h1 m-0">{studentLeads.length}</div>
                                <p className="text-secondary small m-0 fw-bold text-uppercase opacity-75">Lessons Completed</p>
                            </div>
                            <div className="stat-card-modern">
                                <div className="icon-box-primary icon-box-lg mb-2">
                                    <Sparkles size={24} />
                                </div>
                                <div className="h1 m-0">Active Driver</div>
                                <p className="text-secondary small m-0 fw-bold text-uppercase opacity-75">Account Status</p>
                            </div>
                            <div
                                className="stat-card-modern cursor-pointer"
                                onClick={() => {
                                    if (session?.email) {
                                        const refLink = `${window.location.origin}/?ref=${encodeURIComponent(session.email)}`;
                                        navigator.clipboard.writeText(refLink);
                                        alert('Referral link copied to clipboard!\n\n' + refLink);
                                    } else {
                                        alert('Unable to generate referral link. Please try again later.');
                                    }
                                }}
                            >
                                <div className="icon-box-primary icon-box-lg mb-2 text-danger">
                                    <Sparkles size={24} />
                                </div>
                                <div className="h1 m-0">Refer & Save $10</div>
                                <p className="text-secondary small m-0 fw-bold text-uppercase opacity-75">Discount applies to both</p>
                            </div>
                        </div>

                        <div className="grid grid-2-1 gap-4 gap-md-5">
                            <div className="step-container text-start">
                                <h3 className="h3 mb-4 d-flex align-items-center gap-2">
                                    <Clock size={24} /> Driving Schedule
                                </h3>

                                {/* Spotlight Area for Next Lesson */}
                                {nextLesson && (
                                    <div className="next-lesson-card mb-4 mt-2">
                                        <Clock className="card-icon" />
                                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                                            <div>
                                                <span className="small fw-bold opacity-75 text-uppercase">Next Scheduled Lesson</span>
                                                <h2 className="h1 m-0 mt-1 text-white">{new Date(nextLesson.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
                                            </div>
                                            <div className="next-lesson-header-badge">
                                                <span className="fw-bold">{nextLesson.time}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-3 gap-md-5 flex-wrap">
                                            <div className="d-flex align-items-center gap-2">
                                                <User size={18} />
                                                <span>{nextLesson.instructor}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <MapPin size={18} />
                                                <span>{nextLesson.pickupLocation}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {studentLeads.length === 0 ? (
                                    <div className="card-layered text-center opacity-50 textured">
                                        <Calendar size={48} className="mx-auto mb-3" />
                                        <p>Your driving journey starts here.</p>
                                        <button
                                            onClick={() => setView('book')}
                                            className="btn btn-secondary mt-3"
                                        >
                                            Schedule Initial Lesson
                                        </button>
                                    </div>
                                ) : (
                                    <div className="schedule-timeline">
                                        {studentLeads.map((lead, i) => (
                                            <div key={i} className="schedule-item">
                                                <div className="card-layered d-flex justify-content-between align-items-center">
                                                    <div className="d-flex gap-4 align-items-center">
                                                        <div className="timeline-date-box">
                                                            <div className="h2 fw-bold mb-0">{new Date(lead.date + 'T00:00:00').getDate()}</div>
                                                            <div className="text-secondary small fw-bold text-uppercase">{new Date(lead.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</div>
                                                        </div>
                                                        <div className="timeline-divider" />
                                                        <div>
                                                            <div className="fw-bold">{lead.time}</div>
                                                            <div className="text-secondary small d-flex align-items-center gap-2">
                                                                <span>Instructor: {lead.instructor}</span>
                                                                {lead.name !== studentLeads[0].name && <span className="fw-bold text-primary">• {lead.name}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-end d-none d-sm-block">
                                                        <div className="text-secondary small d-flex align-items-center justify-content-end gap-1">
                                                            <MapPin size={12} /> {lead.pickupLocation}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Master's Track was moved below grid-2-1 */}

                            <div className="text-start">
                                <h3 className="h3 mb-4 d-flex align-items-center gap-2">
                                    <BookOpen size={24} className="text-primary" /> Driver&apos;s Resources
                                </h3>
                                <div className="d-flex flex-column gap-3">
                                    <div className="resource-card-container">
                                        <button
                                            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
                                            className="resource-card w-100 border-0 text-start cursor-pointer"
                                        >
                                            <div className="icon-box-primary">
                                                <ListTodo size={20} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="fw-bold text-primary">Pre-Arrival Checklist</div>
                                                <div className="text-secondary small">Required items & road prep</div>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: isChecklistExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronRight size={16} className="text-secondary rotate-90" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {isChecklistExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-3 p-md-4 bg-secondary-subtle rounded-3 mt-2 mx-1 mx-md-2 text-start">
                                                        <h4 className="small fw-bold text-uppercase mb-3 opacity-75">Student Requirements</h4>
                                                        <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                                                            <li className="d-flex align-items-center gap-3 small">
                                                                <div className="rounded-circle bg-primary p-1 checklist-icon-circle">
                                                                    <CheckCircle size={12} className="text-white" />
                                                                </div>
                                                                <span>Bring <strong>Physical Copy</strong> of your Instruction Permit</span>
                                                            </li>
                                                            <li className="d-flex align-items-center gap-3 small">
                                                                <div className="rounded-circle bg-primary p-1 checklist-icon-circle">
                                                                    <CheckCircle size={12} className="text-white" />
                                                                </div>
                                                                <span>Bring <strong>Glasses/Contact Lenses</strong> if prescribed</span>
                                                            </li>
                                                            <li className="d-flex align-items-center gap-3 small">
                                                                <div className="rounded-circle bg-primary p-1" style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <CheckCircle size={12} className="text-white" />
                                                                </div>
                                                                <span>Personal <strong>Water Bottle</strong> (2-hour session)</span>
                                                            </li>
                                                            <li className="d-flex align-items-center gap-3 small">
                                                                <div className="rounded-circle bg-primary p-1" style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <CheckCircle size={12} className="text-white" />
                                                                </div>
                                                                <span>Closed-toe flat shoes (no flip flops)</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>


                                    <a href="https://www.dmv.ca.gov/portal/driver-handbooks/" target="_blank" rel="noopener noreferrer" className="resource-card mb-3">
                                        <div className="icon-box-primary">
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold text-primary">DMV Driver Handbook</div>
                                            <div className="text-secondary small">Official California study guide</div>
                                        </div>
                                        <ArrowRight size={16} className="text-secondary" />
                                    </a>

                                    <div className="resource-card-container">
                                        <button
                                            onClick={() => setExpandedResource(expandedResource === 'youtube-routes' ? null : 'youtube-routes')}
                                            className="resource-card w-100 border-0 text-start"
                                        >
                                            <div className="icon-box-primary text-danger">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="fw-bold text-primary">San Diego DMV Test Routes</div>
                                                <div className="text-secondary small">YouTube video walkthroughs</div>
                                            </div>
                                            {expandedResource === 'youtube-routes' ? <ChevronLeft size={16} className="text-primary rotate-minus-90" /> : <ChevronRight size={16} className="text-secondary" />}
                                        </button>

                                        <AnimatePresence>
                                            {expandedResource === 'youtube-routes' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-3 p-md-4 bg-secondary-subtle rounded-3 mt-2 mx-1 mx-md-2 text-start">
                                                        <h4 className="small fw-bold text-uppercase mb-3 opacity-75">Select Your Test Location</h4>
                                                        <div className="grid grid-2 gap-2">
                                                            <a href="https://www.youtube.com/watch?v=HhUZ4MVNlDM&t=13s" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-accent w-100 text-start d-flex justify-content-between text-white grid-col-full">
                                                                <span className="d-flex align-items-center gap-2"><Clock size={14} /> 5-Min DMV Test Prep</span> <ArrowRight size={14} />
                                                            </a>
                                                            <a href="https://www.youtube.com/results?search_query=San+Ysidro+DMV+driving+test+route" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary w-100 text-start d-flex justify-content-between">
                                                                San Ysidro <ArrowRight size={14} />
                                                            </a>
                                                            <a href="https://www.youtube.com/results?search_query=Clairemont+DMV+driving+test+route" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary w-100 text-start d-flex justify-content-between">
                                                                Clairemont <ArrowRight size={14} />
                                                            </a>
                                                            <a href="https://www.youtube.com/results?search_query=Chula+Vista+DMV+driving+test+route" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary w-100 text-start d-flex justify-content-between">
                                                                Chula Vista <ArrowRight size={14} />
                                                            </a>
                                                            <a href="https://www.youtube.com/results?search_query=El+Cajon+DMV+driving+test+route" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary w-100 text-start d-flex justify-content-between">
                                                                El Cajon <ArrowRight size={14} />
                                                            </a>
                                                            <a href="https://www.youtube.com/results?search_query=San+Diego+Hillcrest+DMV+driving+test+route" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary w-100 text-start d-flex justify-content-between grid-col-full">
                                                                San Diego/Hillcrest <ArrowRight size={14} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Compact Horizontal Milestone Journey - Restored */}
                        <div className="mt-5 pt-4 border-top text-start border-glass">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="icon-box-primary icon-box-lg">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <h3 className="m-0 font-outfit h2">The Master's Track</h3>
                                        <p className="text-secondary small m-0">Your path to independence</p>
                                    </div>
                                </div>
                                <div className="d-none d-md-block text-end">
                                    <span className="badge bg-primary-subtle text-primary px-3 py-1">Milestone Journey</span>
                                </div>
                            </div>

                            <div className="position-relative">
                                {/* Connecting Line Removed */}

                                <div className="grid grid-3 gap-3 position-relative milestone-grid">
                                    {curriculumData.days.map((day: any, idx: number) => {
                                        const myBookings = studentLeads.filter(l => l.email === session?.email);
                                        const completedCount = myBookings.filter(b => {
                                            const bDate = new Date(b.date);
                                            return bDate < new Date();
                                        }).length;

                                        const isMastered = completedCount > idx;
                                        const isCurrent = completedCount === idx;
                                        const isLocked = !isMastered && !isCurrent;

                                        return (
                                            <motion.button
                                                key={day.day}
                                                onClick={() => !isLocked && setSelectedDayModal(day.day)}
                                                className={`resource-card w-100 text-center p-3 d-flex flex-column align-items-center milestone-card ${isCurrent ? 'glass-card-active' : ''} ${isLocked ? 'locked' : ''}`}
                                            >
                                                {/* Milestone Indicator */}
                                                <motion.div
                                                    className={`mb-3 milestone-indicator ${isMastered ? 'mastered' : isCurrent ? 'current' : ''}`}
                                                    animate={isCurrent ? {
                                                        scale: [1, 1.2, 1],
                                                    } : {}}
                                                    transition={isCurrent ? {
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    } : {}}
                                                >
                                                    {isMastered ? <Check size={18} className="text-white" /> : isLocked ? <Lock size={14} className="text-secondary opacity-50" /> : <div className="bg-primary rounded-circle indicator-dot-sm" />}
                                                </motion.div>

                                                <div className={`fw-bold text-uppercase small milestone-day-text ${isMastered ? 'text-primary' : isCurrent ? 'text-accent' : 'text-secondary'}`}>
                                                    Day {day.day}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Skill Briefing Modal */}
                        <AnimatePresence>
                            {selectedDayModal !== null && (
                                <motion.div
                                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-backdrop"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedDayModal(null)}
                                >
                                    <motion.div
                                        className="w-100 modal-container"
                                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* The Actual Rounded Frame with Hardware Clipping */}
                                        <div className="modal-frame">
                                            {/* High-Color Header */}
                                            <div className="modal-header">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <span className="badge bg-white-transparent">Hardened Frame 🛡️</span>
                                                        </div>
                                                        <h2 className="display-small m-0 text-white font-outfit">
                                                            Day {selectedDayModal}: {curriculumData.days.find((d: any) => d.day === selectedDayModal)?.title}
                                                        </h2>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedDayModal(null)}
                                                        className="border-0 rounded-circle modal-close-btn"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4 p-md-5">
                                                <div className="mb-4">
                                                    <h4 className="small fw-bold text-uppercase text-secondary mb-3 d-flex align-items-center gap-2">
                                                        <BookOpen size={14} className="text-primary" />
                                                        Key Skill Mastery
                                                    </h4>
                                                    <div className="grid grid-2 gap-3 skill-mastery-grid">
                                                        {curriculumData.days.find((d: any) => d.day === selectedDayModal)?.skills.map((skill: any, sIdx: number) => (
                                                            <motion.div
                                                                key={skill.id}
                                                                className="d-flex align-items-center gap-3 px-4 px-md-5 py-3 rounded-3 skill-mastery-item text-start"
                                                                initial={{ y: 5, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                transition={{ delay: sIdx * 0.04 }}
                                                            >
                                                                <div className="bg-primary rounded-circle status-indicator-dot flex-shrink-0" />
                                                                <span className="small text-primary fw-medium lh-sm m-0 pe-2 text-break">{skill.text}</span>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="text-center mt-4">
                                                    <button
                                                        onClick={() => setSelectedDayModal(null)}
                                                        className="btn btn-primary w-100 p-3 rounded-3"
                                                    >
                                                        I've got it!
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <div className="card-layered textured-asphalt">
                        {/* Road Path Stepper */}
                        <div className="mb-5 px-3 px-md-5">
                            <div className="step-road-line">
                                <div className="step-road-progress" style={{ width: `${(bookingStep / 2) * 100}% ` }} />
                                {[0, 1, 2].map((s) => (
                                    <div
                                        key={s}
                                        className={`step-road-dot ${bookingStep === s ? 'active' : ''} ${bookingStep > s ? 'completed' : ''}`}
                                        style={{ left: `${(s / 2) * 100}%` }}
                                    />
                                ))}
                            </div>
                            <div className="d-flex justify-content-between mt-2 small fw-bold text-muted">
                                <span className={bookingStep >= 0 ? 'text-primary' : ''}>INSTRUCTOR</span>
                                <span className={bookingStep >= 1 ? 'text-primary' : ''}>DATE & TIME</span>
                                <span className={bookingStep >= 2 ? 'text-primary' : ''}>CONFIRM</span>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {bookingStep === 0 && (
                                <motion.div
                                    key="step0"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-center"
                                >
                                    <h3 className="h2 mb-2">Choose Your Instructor</h3>
                                    <p className="text-secondary mb-5">Select your preferred instructor for this lesson.</p>
                                    <div className="school-instructor-grid">
                                        {instructors.map((instructor) => (
                                            <motion.button
                                                key={instructor.name}
                                                onClick={() => {
                                                    setSelectedInstructor(instructor.name);
                                                    setBookingStep(1);
                                                }}
                                                className={`school-instructor-card ${selectedInstructor === instructor.name ? 'active' : ''}`}
                                                whileHover={{ y: -5 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="school-instructor-avatar">
                                                    <User size={32} />
                                                </div>
                                                <div className="text-start">
                                                    <div className="fw-bold instructor-name-lg">{instructor.name}</div>
                                                    <div className="text-secondary small">{instructor.role}</div>
                                                </div>
                                                {selectedInstructor === instructor.name && (
                                                    <motion.div
                                                        layoutId="activeInstructorPortal"
                                                        className="position-absolute border border-2 border-primary rounded-pill instructor-active-badge"
                                                    />
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {bookingStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                                        <button onClick={() => setBookingStep(0)} className="btn-circle btn-sm">
                                            <ChevronLeft size={18} />
                                        </button>
                                        <h3 className="h3 m-0">Select Date & Time</h3>
                                        <div className="icon-box-lg border-0 bg-transparent" />
                                    </div>

                                    <div className="grid grid-2 gap-4 gap-md-5">
                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h4 className="h5 m-0 fw-bold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
                                                <div className="d-flex gap-2">
                                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="btn-circle btn-sm"><ChevronLeft size={16} /></button>
                                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="btn-circle btn-sm"><ChevronRight size={16} /></button>
                                                </div>
                                            </div>
                                            <div className="calendar-grid">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                                    <div key={d} className="text-center small fw-bold text-secondary mb-2">{d}</div>
                                                ))}
                                                {getDaysInMonth(currentMonth).map((date, i) => {
                                                    if (!date) return <div key={`empty - ${i} `} className="calendar-cell outside" />;
                                                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                                    const dateKey = toLocalISOString(date);
                                                    const isSelected = selectedDate === dateKey;
                                                    const isToday = toLocalISOString(date) === toLocalISOString(new Date());
                                                    const hasAvail = !isPast && generateTimeSlots(date, selectedInstructor, googleBusySlots, busySlots).length > 0;

                                                    return (
                                                        <button
                                                            key={i}
                                                            disabled={isPast}
                                                            onClick={() => {
                                                                setSelectedDate(dateKey);
                                                                setSelectedTime(null);
                                                            }}
                                                            className={`calendar-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasAvail ? 'has-avail' : ''}`}
                                                        >
                                                            {date.getDate()}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="availability-legend">
                                                <span className="legend-dot"></span>
                                                <span>Available Days</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="h5 mb-4 fw-bold d-flex align-items-center gap-2">
                                                <Clock size={18} /> Available Sessions
                                            </h4>
                                            {selectedDate ? (
                                                <div className="d-flex flex-wrap gap-2">
                                                    {isSyncing ? (
                                                        <div className="w-100 text-center py-5">
                                                            <Loader2 className="animate-spin text-primary mx-auto mb-2" />
                                                            <p className="text-secondary small">Checking instructor calendar...</p>
                                                        </div>
                                                    ) : (
                                                        generateTimeSlots(parseLocalDate(selectedDate), selectedInstructor, googleBusySlots, busySlots).length > 0 ? (
                                                            generateTimeSlots(parseLocalDate(selectedDate), selectedInstructor, googleBusySlots, busySlots).map(time => (
                                                                <button
                                                                    key={time}
                                                                    onClick={() => {
                                                                        setSelectedTime(time);
                                                                        setBookingStep(2);
                                                                    }}
                                                                    className={`time-chip flex-column gap-1 align-items-center justify-content-center p-3 ${selectedTime === time ? 'active' : ''}`}
                                                                >
                                                                    <div className="fw-bold">{time}</div>
                                                                    <div className="small opacity-75 fw-normal">
                                                                        ${parseLocalDate(selectedDate).getDay() === 0 || parseLocalDate(selectedDate).getDay() === 6 ? '160' : '140'}
                                                                    </div>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <p className="text-secondary small py-4 bg-secondary-subtle rounded-3 w-100 text-center">No open sessions for this day.</p>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-5 opacity-50 bg-secondary-subtle rounded-3">
                                                    <Calendar size={32} className="mx-auto mb-2" />
                                                    <p className="small m-0">Select a date to view available times</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {bookingStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-center"
                                >
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                                        <button onClick={() => setBookingStep(1)} className="btn-circle btn-sm">
                                            <ChevronLeft size={18} />
                                        </button>
                                        <h3 className="h3 m-0">Final Verification</h3>
                                        <div className="icon-box-lg border-0 bg-transparent" />
                                    </div>

                                    <div className="card-layered p-4 mb-5 text-start textured success-card w-100">
                                        <div className="grid grid-2 gap-4">
                                            <div className="d-flex gap-3">
                                                <Calendar className="text-primary" />
                                                <div>
                                                    <div className="small text-secondary fw-bold text-uppercase">Date & Time</div>
                                                    <div className="fw-bold">{parseLocalDate(selectedDate!).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                                                    <div className="text-primary">{selectedTime} (2hr)</div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-3">
                                                <User className="text-primary" />
                                                <div>
                                                    <div className="small text-secondary fw-bold text-uppercase">Instructor</div>
                                                    <div className="fw-bold">{selectedInstructor}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-start mb-5 booking-form-container">
                                        <div className="school-input-group mb-4 z-20">
                                            <label className="form-label">Pickup Location</label>

                                            {/* Toggle Type */}
                                            <div
                                                className="d-flex gap-2 mb-4 p-1 bg-secondary-subtle rounded-3 border"
                                                style={{ borderColor: "var(--glass-border)" }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setPickupType("address")}
                                                    className={`flex-grow-1 small ${pickupType === "address" ? "shadow-sm text-white fw-bold" : "text-secondary hover-text-primary"}`}
                                                    style={{
                                                        borderRadius: "0.5rem",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s",
                                                        padding: "0.75rem",
                                                        background: pickupType === "address" ? "var(--primary)" : "transparent",
                                                        color: pickupType === "address" ? "white" : "inherit"
                                                    }}
                                                >
                                                    Home Address
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPickupType("school")}
                                                    className={`flex-grow-1 small ${pickupType === "school" ? "shadow-sm text-white fw-bold" : "text-secondary hover-text-primary"}`}
                                                    style={{
                                                        borderRadius: "0.5rem",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s",
                                                        padding: "0.75rem",
                                                        background: pickupType === "school" ? "var(--primary)" : "transparent",
                                                        color: pickupType === "school" ? "white" : "inherit"
                                                    }}
                                                >
                                                    School Pickup
                                                </button>
                                            </div>

                                            <div className="d-flex flex-column gap-3">
                                                {pickupType === 'address' ? (
                                                    <>
                                                        <div className="position-relative">
                                                            <MapPin size={18} className="position-absolute text-secondary" style={{ top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                                                            <input
                                                                type="text"
                                                                className="school-input"
                                                                style={{ paddingLeft: '2.8rem' }}
                                                                placeholder="Street Address (e.g. 123 Main St)"
                                                                value={pickupAddress.street}
                                                                onChange={(e) => setPickupAddress({ ...pickupAddress, street: e.target.value })}
                                                                required={pickupType === 'address'}
                                                            />
                                                        </div>
                                                        <div className="d-flex gap-3">
                                                            <input
                                                                type="text"
                                                                className="school-input"
                                                                placeholder="City"
                                                                value={pickupAddress.city}
                                                                onChange={(e) => setPickupAddress({ ...pickupAddress, city: e.target.value })}
                                                                required={pickupType === 'address'}
                                                                style={{ flex: 3 }}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="school-input text-center px-1"
                                                                placeholder="State"
                                                                defaultValue="CA"
                                                                required={pickupType === 'address'}
                                                                style={{ flex: 1, minWidth: '60px' }}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="school-input"
                                                                placeholder="Zip Code"
                                                                value={pickupAddress.zip}
                                                                onChange={(e) => setPickupAddress({ ...pickupAddress, zip: e.target.value })}
                                                                required={pickupType === 'address'}
                                                                style={{ flex: 2 }}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="position-relative">
                                                            <MapPin size={18} className="position-absolute text-secondary" style={{ top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                                                            <input
                                                                type="text"
                                                                className="school-input"
                                                                style={{ paddingLeft: '2.8rem' }}
                                                                placeholder="School Name (e.g. Eastlake High)"
                                                                value={pickupAddress.schoolName}
                                                                onChange={(e) => setPickupAddress({ ...pickupAddress, schoolName: e.target.value })}
                                                                required={pickupType === 'school'}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-secondary small mt-2">Preferred meetup point? (Home, School, Public Location)</p>
                                        </div>

                                        <div className="school-input-group">
                                            <label className="form-label">Payment Method</label>
                                            <div className="d-flex flex-column gap-2 mb-3">
                                                {PAYMENT_METHODS.map(method => (
                                                    <button
                                                        key={method}
                                                        onClick={() => setPaymentMethod(method)}
                                                        className={`school-input text-start d-flex justify-content-between align-items-center cursor-pointer ${paymentMethod === method ? 'border-primary bg-secondary' : 'bg-primary'}`}
                                                        style={{ height: 'auto' }}
                                                    >
                                                        <span className="fw-bold">{method}</span>
                                                        {paymentMethod === method && <CheckCircle size={18} className="text-primary" />}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="d-flex align-items-start gap-2 p-3 bg-secondary-subtle rounded-3 text-secondary small border border-glass">
                                                <AlertCircle size={16} className="text-primary mt-1 flex-shrink-0" />
                                                <div><strong>Note:</strong> Payment is required before the lesson begins.</div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        className="btn btn-primary w-100 p-3 rounded-3 max-w-500"
                                    >
                                        Confirm Session Reservation
                                    </button>
                                </motion.div>
                            )}

                            {bookingStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-5"
                                >
                                    <div className="success-icon-container">
                                        <CheckCircle size={56} strokeWidth={2.5} />
                                    </div>
                                    <h1 className="display-small mb-3 font-outfit">Session Reserved! 🎉</h1>
                                    <p className="body-large text-secondary mb-5 booking-form-container">
                                        Your lesson with <strong>{selectedInstructor}</strong> on <strong>{new Date(selectedDate!).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</strong> is confirmed.
                                        We&apos;ve added this to your dashboard and sent a confirmation email.
                                    </p>
                                    <motion.button
                                        onClick={() => setView('overview')}
                                        className="btn btn-primary px-5 p-3 rounded-3"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Return to My Schedule
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

        </div >
    );
};

export default StudentPortal;
