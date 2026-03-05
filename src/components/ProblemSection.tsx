import React from 'react';
import { motion } from 'framer-motion';
import { TriangleAlert, ClipboardCheck, ShieldCheck } from 'lucide-react';
import '../styles/components/ProblemSection.css';

const ProblemSection: React.FC = () => {

    return (
        <section id="problem" className="section textured wallpaper-cone problem-section">
            <div className="container">
                <div className="problem-header">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="display-small problem-title">The Smart Way to <span className="text-accent">Get Your License.</span></h2>
                        <p className="body-large text-secondary problem-subtitle">
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
                            className="card-layered textured problem-card"
                        >
                            <div className="problem-icon-wrapper">
                                <prob.icon size={30} color="var(--primary)" />
                            </div>
                            <h3 className="h4 problem-card-title">{prob.title}</h3>
                            <p className="problem-card-desc">{prob.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
