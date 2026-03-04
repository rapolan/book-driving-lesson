import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Map, Smile } from 'lucide-react';

const SuccessSection: React.FC = () => {
    return (
        <section id="success" className="section wallpaper-cone" style={{ borderTop: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-primary)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 800 }}>Master the Road. <span style={{ color: 'var(--primary)' }}>Earn Your License.</span></h2>
                        <p className="body-large text-secondary" style={{ maxWidth: '700px', margin: '0 auto' }}>
                            A driver's license is more than identification. It's the key to your independence and lifelong safety and confidence on the road.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="card-layered textured"
                        style={{ backgroundColor: 'var(--primary)', color: 'var(--bg-primary)', border: 'none' }}
                    >
                        <h3 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--bg-primary)' }}>Clear Outcomes</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {[
                                { icon: Map, text: "Successfully earn your state-certified license." },
                                { icon: Smile, text: "Drive with confidence in city and highway traffic." },
                                { icon: Heart, text: "Build a lifetime of safe and smart driving habits." }
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
                                    <item.icon size={24} />
                                    <span>{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="card-layered textured"
                    >
                        <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Avoid the Risk</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
                            Don't leave your safety to chance:
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {[
                                "Falling into bad habits that lead to accidents.",
                                "Missing important rules and failing your road test.",
                                "The stress of being unprepared for real-world driving."
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent)', borderRadius: '50%' }} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default SuccessSection;
