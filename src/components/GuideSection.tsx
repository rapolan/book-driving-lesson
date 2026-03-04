import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users } from 'lucide-react';

const GuideSection: React.FC = () => {
    return (
        <section id="about" className="section">
            <div className="container">
                <div className="grid grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{ position: 'relative' }}
                    >
                        <div style={{
                            width: '100%',
                            height: '500px',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '2rem',
                            backgroundImage: 'url("/anime-dmv.webp")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            boxShadow: 'var(--shadow-lg)'
                        }} />
                        <div className="glass" style={{
                            position: 'absolute',
                            top: '2rem',
                            right: '-2rem',
                            padding: '2rem',
                            borderRadius: '1.5rem',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <div className="display-small" style={{ fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>100%</div>
                            <div className="small text-secondary" style={{ lineHeight: 1.2, marginTop: '0.25rem' }}>
                                Satisfaction<br />Guaranteed ✨✅
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="display-small" style={{ marginBottom: '1.5rem' }}>Expert Training. <span style={{ color: 'var(--primary)' }}>Proven Results.</span></h2>
                        <p className="body-large text-secondary" style={{ marginBottom: '2rem', lineHeight: 1.6 }}>
                            We provide high-quality driver education that students enjoy and parents trust, focusing on building safe, capable drivers through clear and professional training.
                        </p>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {[
                                { icon: Shield, title: "Patient & Empathetic", desc: "We never rush or yell. Your comfort is our priority." },
                                { icon: Award, title: "Certified Expertise", desc: "Top-tier training from industry veterans." },
                                { icon: Users, title: "Highly Experienced", desc: "Over 10+ years of combined experience." }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        padding: '0.75rem',
                                        borderRadius: '1rem'
                                    }}>
                                        <item.icon color="var(--primary)" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="h5" style={{ marginBottom: '0.5rem' }}>{item.title}</h4>
                                        <p style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default GuideSection;
