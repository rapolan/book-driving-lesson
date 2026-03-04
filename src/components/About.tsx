import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, Shield, Star } from 'lucide-react';

const About: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="about-page">
            <section className="section">
                <div className="container">
                    {/* Hero Section */}
                    <header style={{ textAlign: 'center', marginBottom: '6rem', marginTop: '4rem' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                                Expert <span style={{ color: 'var(--primary)' }}>Instruction</span>
                            </h1>
                            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
                                A personalized, family-run approach to safe driving. We are licensed instructors partnered with Budget Driving School LLC to render professional road training services.
                            </p>
                        </motion.div>
                    </header>

                    {/* The Concept Section */}
                    <div className="grid grid-2" style={{ alignItems: 'center', gap: '4rem', marginBottom: '8rem' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="badge">The Instructors</div>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Siblings in Safety</h2>
                            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
                                We started this journey with a shared mission: to provide patient, consistent instruction for students and their families. We aren't a high-volume factory; we are individual licensed instructors who care about your progress.
                            </p>
                            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                Through our partnership with Budget Driving School LLC, we are able to provide official, high-quality behind-the-wheel training that meets all state requirements while maintaining the personal touch of a family duo.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="card-layered textured"
                            style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <Users size={80} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                <p style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.5rem', color: 'var(--primary)' }}>Family Owned & Operated</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Values Grid */}
                    <div style={{ marginBottom: '8rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <h2 style={{ fontSize: '2.5rem' }}>Our Core Pillars</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            {[
                                {
                                    icon: Heart,
                                    title: "A Family's Patience",
                                    desc: "The kind of genuine patience only a family-run team can provide. No yelling, no rushing—just clear, supportive guidance."
                                },
                                {
                                    icon: Shield,
                                    title: "Built on Trust",
                                    desc: "Your family trusts us with their most valuable members. We honor that trust through rigorous safety standards and personalized care."
                                },
                                {
                                    icon: Star,
                                    title: "Modern Instruction",
                                    desc: "We leave the outdated methods behind. Our certified training is engaging, relatable, and tailored to how today's students learn best."
                                }
                            ].map((pillar, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="card-layered textured"
                                    style={{ padding: '2.5rem', textAlign: 'center' }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1.5rem',
                                        color: 'var(--primary)'
                                    }}>
                                        <pillar.icon size={30} />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{pillar.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{pillar.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

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
                                Join the <span className="gradient-text">Family</span>
                            </h2>
                            <p className="body-large text-secondary" style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                                Connect with professional instructors who prioritize your safety and comfort.
                            </p>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '1.25rem 4rem', fontSize: '1.125rem', borderRadius: '1rem', fontWeight: 700 }}
                                onClick={() => navigate('/#booking')}
                            >
                                Book a Lesson
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
