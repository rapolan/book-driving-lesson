import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, CheckCircle } from 'lucide-react';

const PlanSection: React.FC = () => {
    const steps = [
        {
            icon: Calendar,
            title: "1. Get Your Permit",
            desc: "We help you understand exactly what you need to study and the paperwork required to get your instruction permit."
        },
        {
            icon: BookOpen,
            title: "2. Master the Road",
            desc: "Complete your required training hours with Nat or Rob, teaching you how to stay safe in any traffic."
        },
        {
            icon: CheckCircle,
            title: "3. Pass Your Test",
            desc: "Finish your training with a mock exam and walk into your state road test with total confidence."
        }
    ];

    return (
        <section id="plan" className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '3rem 3rem 0 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="display-small" style={{ marginBottom: '1.5rem' }}>Your Path to <span style={{ color: 'var(--primary)' }}>Success.</span></h2>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                            We've simplified the journey with our proven 3-day milestone curriculum. No stress, no confusion—just clear goals.
                        </p>
                    </motion.div>
                </div>

                <div style={{ position: 'relative' }}>
                    {/* Curved Road Path for Desktop */}
                    <svg style={{
                        position: 'absolute',
                        top: '120px',
                        left: '0',
                        width: '100%',
                        height: '100px',
                        zIndex: 0,
                        opacity: 0.3,
                        display: 'none'
                    }} className="desktop-road-line" viewBox="0 0 1200 100" preserveAspectRatio="none">
                        <path
                            d="M100 50 Q300 100 600 50 T1100 50"
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="4"
                            className="road-path-animated"
                        />
                    </svg>

                    <div className="grid grid-3" style={{ position: 'relative', zIndex: 1 }}>
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="card-layered textured"
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 2rem',
                                    border: '4px solid var(--primary)',
                                    boxShadow: '0 0 0 8px var(--glass-border)'
                                }}>
                                    <step.icon size={32} color="var(--primary)" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>{step.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '1.25rem 3rem', fontSize: '1.125rem' }}
                        onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Start Your Journey Now
                    </button>
                </div>
            </div>
        </section>
    );
};

export default PlanSection;
