import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, UserPlus, BookOpen, Search, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import '../styles/pages/PermitGuide.css';

const PermitGuide: React.FC = () => {
    const navigate = useNavigate();
    const [ageGroup, setAgeGroup] = useState<'under-18' | 'over-18'>('under-18');

    const under18Modules = [
        {
            id: 'eligibility',
            title: '1. Eligibility Check',
            icon: UserPlus,
            content: (
                <ul className="guide-list">
                    <li>Must be at least 15½ years old (but under 18).</li>
                    <li>If you are under 17½, you <strong>must</strong> complete Driver Education.</li>
                </ul>
            )
        },
        {
            id: 'driver-ed',
            title: '2. Complete Driver Education',
            icon: BookOpen,
            content: (
                <>
                    <p>Complete a DMV-approved driver education course (30 hours of classroom or online instruction).</p>
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a
                            href="https://budgetds.learndrivered.com/signup/index.asp?secure=1&"
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                            style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '0.75rem 1.5rem' }}
                        >
                            Start Online Course
                        </a>
                        <p className="small opacity-75">
                            Prefer a classroom setting? We partner with a **local driving school in San Diego** and recommend their <a href="https://www.budgetdrivingschoolonline.com/driveredclassroom.php" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>In-person Class Option</a>.
                        </p>
                    </div>
                    <div className="alert-box">
                        <strong>Required Document:</strong> Certificate of Completion of Driver Education (DL 400C).
                    </div>
                </>
            )
        },
        {
            id: 'dmv-checklist',
            title: '3. Gather Documents',
            icon: FileText,
            content: (
                <ul className="guide-list">
                    <li><strong>Online Application:</strong> Complete the <a href="https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/dl-id-online-app-edl/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>California Driver’s License or ID Card Application</a> (DL 44) online. Parents/guardians must sign electronically.</li>
                    <li><strong>Identity:</strong> Original Birth Certificate or valid U.S. Passport.</li>
                    <li><strong>Social Security Number:</strong> Have your SSN ready.</li>
                    <li><strong>Residency:</strong> Parents provide <strong>two (2)</strong> proofs of residency.</li>
                </ul>
            )
        },
        {
            id: 'dmv-visit',
            title: '4. The DMV Visit',
            icon: Search,
            content: (
                <ul className="guide-list">
                    <li><strong>Appointment:</strong> Recommended to schedule online at <a href="https://www.dmv.ca.gov/portal/appointments/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>dmv.ca.gov/appointments</a>.</li>
                    <li><strong>Vision Test:</strong> Pass a basic eye exam.</li>
                    <li><strong>Application Fee:</strong> Pay the non-refundable fee (approx. $45).</li>
                </ul>
            )
        },
        {
            id: 'knowledge-test',
            title: '5. Pass the Knowledge Test',
            icon: CheckCircle,
            content: (
                <>
                    <p>The test has 46 questions. You must correctly answer at least 38 (max 8 errors).</p>
                    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                        <a
                            href="https://www.budgetdrivingschoolonline.com/driveredonline.php"
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary small"
                            style={{
                                display: 'inline-flex',
                                padding: '0.75rem 1.5rem'
                            }}
                        >
                            Take a Practice Test
                        </a>
                    </div>
                    <div className="alert-box">
                        <strong>Tip:</strong> You have 3 chances to pass. If you fail, wait 7 days to retake.
                    </div>
                </>
            )
        },
        {
            id: 'next-steps',
            title: '6. Validating Your Permit',
            icon: Clock,
            content: (
                <>
                    <p>Your permit is <strong>not valid</strong> until you start your first behind-the-wheel training lesson.</p>
                    <p>The instructor will sign your permit to validate it.</p>
                </>
            )
        }
    ];

    const over18Modules = [
        {
            id: 'eligibility-18',
            title: '1. Eligibility & Identity',
            icon: ShieldCheck,
            content: (
                <ul className="guide-list">
                    <li>Must be at least 18 years old.</li>
                    <li>Driver Education is <strong>recommended</strong> but not required.</li>
                </ul>
            )
        },
        {
            id: 'dmv-checklist-18',
            title: '2. Gather Documents',
            icon: FileText,
            content: (
                <ul className="guide-list">
                    <li><strong>Application:</strong> Complete the <a href="https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/dl-id-online-app-edl/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>DL 44 application online</a>. You sign for yourself.</li>
                    <li><strong>Identity:</strong> Original Birth Certificate, Passport, or Residency Card.</li>
                    <li><strong>SSN:</strong> Provide your Social Security Number.</li>
                    <li><strong>Residency:</strong> Bring <strong>two (2)</strong> different documents proving you live in California.</li>
                </ul>
            )
        },
        {
            id: 'dmv-visit-18',
            title: '3. DMV Appointment',
            icon: Search,
            content: (
                <ul className="guide-list">
                    <li><a href="https://www.dmv.ca.gov/portal/appointments/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Schedule an Appointment</a> (Recommended).</li>
                    <li>Pay the application fee (covers permit and license).</li>
                    <li>Pass the Vision Exam.</li>
                    <li>Get your thumbprint and photo taken.</li>
                </ul>
            )
        },
        {
            id: 'knowledge-test-18',
            title: '4. Pass Knowledge Test',
            icon: CheckCircle,
            content: (
                <>
                    <p>Answer at least 38 out of 46 questions correctly (80% passing score).</p>
                    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                        <a
                            href="https://www.dmv.ca.gov/portal/driver-education-and-safety/educational-materials/sample-driver-license-dl-knowledge-tests/"
                            target="_blank"
                            rel="noreferrer"
                            className="btn small"
                            style={{
                                display: 'inline-flex',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-primary)',
                                padding: '0.6rem 1.25rem'
                            }}
                        >
                            Take a Practice Test
                        </a>
                    </div>
                    <div className="alert-box">
                        <strong>Note:</strong> Tests are usually not administered after 4:30 PM.
                    </div>
                </>
            )
        },
        {
            id: 'next-steps-18',
            title: '5. Using Your Permit',
            icon: Clock,
            content: (
                <>
                    <p>Your permit is valid immediately. You can practice with any licensed CA driver who is 18 years or older.</p>
                    <p>It is valid for 12 months.</p>
                </>
            )
        }
    ];

    const activeModules = ageGroup === 'under-18' ? under18Modules : over18Modules;

    return (
        <div className="permit-guide-page page-top-padding">
            <div className="container">
                <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="display-large"
                        style={{ marginBottom: '1.5rem' }}
                    >
                        California <span className="text-accent">Permit Guide</span>
                    </motion.h1>
                    <p className="body-large text-secondary" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        Everything you need to know about getting your learner's permit in California.
                    </p>
                </header>

                <div className="age-toggle-container">
                    {[
                        { id: 'under-18', label: 'Under 18' },
                        { id: 'over-18', label: 'Over 18' }
                    ].map((choice) => (
                        <button
                            key={choice.id}
                            onClick={() => setAgeGroup(choice.id as any)}
                            className="body-large age-toggle-btn"
                            style={{
                                color: ageGroup === choice.id ? '#ffffff' : 'var(--text-secondary)',
                                zIndex: 1
                            }}
                        >
                            {choice.label}
                            {ageGroup === choice.id && (
                                <motion.div
                                    layoutId="active-tab"
                                    className="age-toggle-active-bg"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="guide-modules" style={{ position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        left: '32px',
                        top: '0',
                        bottom: '0',
                        width: '2px',
                        zIndex: 0,
                        overflow: 'hidden'
                    }} className="desktop-road-line">
                        <svg width="2" height="100%" style={{ opacity: 0.2 }}>
                            <line
                                x1="1" y1="0" x2="1" y2="10000"
                                stroke="var(--accent)"
                                strokeWidth="2"
                                strokeDasharray="10, 10"
                                className="road-path-animated"
                            />
                        </svg>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={ageGroup}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeModules.map((module) => (
                                <motion.div
                                    key={module.id}
                                    id={module.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="card-layered textured"
                                    style={{ marginBottom: '2rem' }}
                                >
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            border: '1px solid var(--glass-border)',
                                            color: 'var(--primary)'
                                        }}>
                                            <module.icon size={32} />
                                        </div>
                                        <div style={{ flex: 1, paddingTop: '0.5rem' }}>
                                            <h2 className="display-small" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>{module.title}</h2>
                                            <div className="body-large text-secondary" style={{ lineHeight: 1.6 }}>
                                                {module.content}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <section className="section wallpaper-cone" style={{ borderTop: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-primary)', marginTop: '4rem' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="card-layered textured-asphalt text-center" style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid var(--glass-border)' }}>
                            <h2 className="display-small" style={{ marginBottom: '1.5rem', fontWeight: 800 }}>
                                Ready to Start <span className="text-accent">Driving?</span>
                            </h2>
                            <p className="body-large text-secondary" style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                                Book your behind-the-wheel training to validate your permit with our expert instructors.
                            </p>
                            <button
                                className="btn btn-primary btn-cta body-large"
                                onClick={() => navigate('/#booking')}
                            >
                                View Lesson Schedule
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default PermitGuide;
