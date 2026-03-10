import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import '../styles/components/Hero.css';

const Hero: React.FC = () => {
    return (
        <section id="hero" className="section textured hero-section">
            {/* Minimalist Road Elements */}
            <div className="hero-road-circle" />
            <svg
                className="hero-road-svg"
                viewBox="0 0 400 100"
            >
                <path
                    d="M0 50 Q100 0 200 50 T400 50"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="4"
                    className="road-path-animated"
                />
            </svg>

            <div className="container hero-content-wrapper">
                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="hero-title">
                            Master the Road with <span className="text-accent">Confidence.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Expert instruction from a dedicated sibling duo serving Chula Vista & South Bay San Diego. We guide you and your family through every step with a personal, professional touch.
                        </p>
                        <div className="hero-actions">
                            <button
                                className="btn btn-primary hero-btn"
                                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Book Lesson
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Subtle Scroll Indicator */}
            <motion.div
                className="scroll-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{
                    opacity: { delay: 1.5, duration: 1 },
                    y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            >
                <ChevronDown size={32} className="text-secondary opacity-75" />
            </motion.div>
        </section>
    );
};

export default Hero;
