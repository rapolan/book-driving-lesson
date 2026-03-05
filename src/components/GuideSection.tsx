import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users } from 'lucide-react';
import '../styles/components/GuideSection.css';

const GuideSection: React.FC = () => {
    return (
        <section id="about" className="section">
            <div className="container">
                <div className="grid grid-2 guide-grid">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="guide-image-container"
                    >
                        <div className="guide-image" />
                        <div className="glass guide-badge-floating">
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
                        <h2 className="display-small guide-title">Expert Training. <span style={{ color: 'var(--primary)' }}>Proven Results.</span></h2>
                        <p className="body-large text-secondary guide-content-text">
                            We provide high-quality driver education that students enjoy and parents trust, focusing on building safe, capable drivers through clear and professional training.
                        </p>

                        <div className="guide-items-list">
                            {[
                                { icon: Shield, title: "Patient & Empathetic", desc: "We never rush or yell. Your comfort is our priority." },
                                { icon: Award, title: "Certified Expertise", desc: "Top-tier training from industry veterans." },
                                { icon: Users, title: "Highly Experienced", desc: "Over 10+ years of combined experience." }
                            ].map((item, i) => (
                                <div key={i} className="guide-item">
                                    <div className="guide-item-icon-wrapper">
                                        <item.icon color="var(--primary)" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="h5 guide-item-title">{item.title}</h4>
                                        <p className="guide-item-desc">{item.desc}</p>
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
