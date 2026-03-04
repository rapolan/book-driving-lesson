import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PlanPage: React.FC = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const timelineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    const steps = [
        {
            icon: Calendar,
            title: "Get Your Permit",
            desc: "Understand exactly what you need to study and the paperwork required to get your instruction permit.",
            image: "/permit-sample.png",
            link: { label: "View Full Permit Guide", href: "/permit-guide" },
            details: [
                "Complete a California-approved Online Driver Education course.",
                "Study the official California DMV Driver&apos;s Handbook.",
                "Gather required documents (Birth Certificate, SSN, 2 Proofs of Residency).",
                "Pass the 46-question written knowledge test at your local DMV."
            ]
        },
        {
            icon: BookOpen,
            title: "Master the Road",
            desc: "Complete your required 6 hours of professional behind-the-wheel training through our proven 3-day milestone curriculum.",
            image: "/anime-driver.webp",
            details: [
                "Lesson 1: Vehicle controls, basic right-of-way rules, mastering hand-over-hand steering, and critical visual scanning.",
                "Lesson 2: Defensive driving, lane changes, freeway driving, and navigating moderate traffic.",
                "Lesson 3: Complex intersections, advanced parking, and DMV road test preparation."
            ]
        },
        {
            icon: CheckCircle,
            title: "Pass Your Test",
            desc: "Finish your prerequisite practice hours, review advanced maneuvers, and walk into your DMV exam with total confidence.",
            image: "/anime-dmv.webp",
            details: [
                "Complete your state-required 50 hours of supervised practice.",
                "Take a final mock exam run-through with our instructors.",
                "Review the specific elements examiners look for during the road test.",
                "Receive your Certificate of Completion (DL 400D) to take your test."
            ]
        }
    ];

    return (
        <div className="plan-page" style={{ paddingTop: '8rem', paddingBottom: '0' }}>



            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header Section */}
                <header style={{ textAlign: 'center', marginBottom: '8rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                            Your Path to <span style={{ color: 'var(--primary)' }}>Success.</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                            We&apos;ve simplified the journey into three easy steps. No stress, no confusion—just a clear road to your California Driver&apos;s License.
                        </p>
                    </motion.div>
                </header>

                {/* Steps Section */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10rem', paddingBottom: '8rem' }}>

                    {/* Ambient Background Glows */}
                    <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '600px', height: '600px', border: '80px solid rgba(74, 103, 65, 0.03)', borderRadius: '50%', zIndex: -2, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '20%', right: '-10%', width: '500px', height: '500px', border: '60px solid rgba(180, 106, 77, 0.03)', borderRadius: '50%', zIndex: -2, pointerEvents: 'none' }} />

                    {/* Visual Center Timeline Line (Desktop Only) */}
                    <svg style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100px', zIndex: -1, opacity: 0.15, pointerEvents: 'none' }} viewBox="0 0 100 2000" preserveAspectRatio="none" className="d-none d-md-block">
                        <line x1="50" y1="0" x2="50" y2="2000" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 18" />
                        <motion.line
                            x1="50" y1="0" x2="50" y2="2000"
                            stroke="var(--primary)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            style={{ pathLength: timelineHeight }}
                        />
                    </svg>

                    {steps.map((step, i) => {
                        const isEven = i % 2 === 0;
                        return (
                            <div key={i} className="grid grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
                                {/* Text Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                    style={{ order: isEven ? 1 : 2 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid var(--glass-border)',
                                            flexShrink: 0
                                        }}>
                                            <step.icon size={32} color="var(--primary)" />
                                        </div>
                                        <h2 style={{ fontSize: '3rem', margin: 0, fontWeight: 800 }}>{step.title}</h2>
                                    </div>
                                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                                        {step.desc}
                                    </p>

                                    {(step as any).link && (
                                        <Link
                                            to={(step as any).link.href}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                color: 'var(--primary)',
                                                fontWeight: 700,
                                                textDecoration: 'none',
                                                marginBottom: '3rem',
                                                fontSize: '1.125rem',
                                                padding: '0.875rem 2rem',
                                                borderRadius: '2rem',
                                                border: '1px solid var(--primary)',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--primary)';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--primary)';
                                            }}
                                        >
                                            {(step as any).link.label} <ArrowRight size={16} />
                                        </Link>
                                    )}

                                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                                        {step.details.map((detail, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                                <div style={{
                                                    backgroundColor: 'var(--bg-secondary)',
                                                    padding: '0.5rem',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '36px',
                                                    height: '36px',
                                                    flexShrink: 0
                                                }}>
                                                    <CheckCircle color="var(--primary)" size={18} />
                                                </div>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.6, margin: 0, paddingTop: '0.1rem' }}>{detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Image with Glass Accent */}
                                <motion.div
                                    initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                    style={{ order: isEven ? 2 : 1, position: 'relative' }}
                                >
                                    {step.image.includes('permit') ? (
                                        <div style={{
                                            width: '100%',
                                            height: '500px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: '2rem',
                                            boxShadow: 'var(--shadow-lg)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            {/* decorative background pattern matching the hero style */}
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                opacity: 0.4,
                                                backgroundImage: 'radial-gradient(circle at 2px 2px, var(--glass-border) 1px, transparent 0)',
                                                backgroundSize: '24px 24px'
                                            }} />

                                            {/* The image presented as a floating document */}
                                            <motion.img
                                                src={step.image}
                                                alt="Sample California Permit"
                                                style={{
                                                    maxWidth: '85%',
                                                    maxHeight: '85%',
                                                    objectFit: 'contain',
                                                    borderRadius: '0.5rem',
                                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5)',
                                                    position: 'relative',
                                                    zIndex: 1
                                                }}
                                                whileHover={{ scale: 1.02, rotate: -1 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '500px',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: '2rem',
                                            backgroundImage: `url("${step.image}")`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            boxShadow: 'var(--shadow-lg)'
                                        }} />
                                    )}
                                    <div className="glass" style={{
                                        position: 'absolute',
                                        top: '2rem',
                                        right: '-2rem',
                                        zIndex: 10,
                                        padding: '1.5rem 2rem',
                                        borderRadius: '1.5rem',
                                        boxShadow: 'var(--shadow-lg)'
                                    }}>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>Step {i + 1}</div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Final CTA Full Width using wallpaper-cone style */}
            <section className="section wallpaper-cone" style={{ borderTop: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-primary)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="card-layered textured-asphalt text-center" style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid var(--glass-border)' }}>
                            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                                Ready to Take the <span className="gradient-text">Wheel?</span>
                            </h2>
                            <p className="body-large text-secondary" style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                                The first step to freedom on the road starts right here. Book your first lesson today and secure your spot on our schedule.
                            </p>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '1.25rem 4rem', fontSize: '1.125rem', borderRadius: '1rem', fontWeight: 700 }}
                                onClick={() => navigate('/#booking')}
                            >
                                Book Your First Lesson
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default PlanPage;
