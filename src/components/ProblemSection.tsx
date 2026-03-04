import React from 'react';
import { motion } from 'framer-motion';
import { TriangleAlert, ClipboardCheck, ShieldCheck } from 'lucide-react';

const ProblemSection: React.FC = () => {

    return (
        <section id="problem" className="section textured wallpaper-cone" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="display-small" style={{ marginBottom: '1.5rem', fontWeight: 800 }}>The Smart Way to <span className="gradient-text">Get Your License.</span></h2>
                        <p className="body-large text-secondary" style={{ maxWidth: '700px', margin: '0 auto' }}>
                            Getting on the road shouldn&apos;t be a source of stress. As a brother-sister team, we&apos;ve helped hundreds of families skip the confusion and build the real confidence needed to pass.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-3">
                    {[
                        {
                            icon: TriangleAlert,
                            title: "Fixing Bad Habits",
                            desc: "Learning on your own can lead to mistakes that fail tests. We teach you the professional way to drive from day one so you never have to second-guess your skills."
                        },
                        {
                            icon: ClipboardCheck,
                            title: "Clear Requirements",
                            desc: "State rules and paperwork can be a headache. We guide you through the process, taking the weight off your shoulders so you're always ready for the next step."
                        },
                        {
                            icon: ShieldCheck,
                            title: "Safe Foundations",
                            desc: "Walking into a test without a plan is stressful. We give you the safety skills and mental preparation needed to pass with total confidence."
                        }
                    ].map((prob, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="card-layered textured"
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <prob.icon size={30} color="var(--primary)" />
                            </div>
                            <h3 className="h4" style={{ marginBottom: '1rem' }}>{prob.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{prob.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
