import React, { useState } from 'react';
import { Car, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/components/Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';
  const isDashboard = location.pathname === '/portal' || location.pathname === '/admin-school';

  const navLinks = [
    { name: 'About', href: '/about', isHash: false },
    { name: 'Permit Guide', href: '/permit-guide', isHash: false },
    { name: 'Plan', href: '/plan', isHash: false },
  ];

  const handleNavClick = (href: string, isHash: boolean) => {
    if (isHash) {
      const id = href.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="glass navbar-container">
      <Link to="/" className="navbar-logo-link">
        <Car size={32} color="var(--primary)" />
        <span className="navbar-logo-text">DrivingLesson.Me</span>
      </Link>

      <div className="navbar-links-wrapper">
        <div className="navbar-desktop-links">
          {navLinks.filter(link => !isDashboard || link.name === 'About').map((link) => (
            link.isHash ? (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href, true);
                }}
                className="navbar-link"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className="navbar-link"
              >
                {link.name}
              </Link>
            )
          ))}
          {!isDashboard && (
            <Link to="/portal" className="navbar-link">
              Student Portal
            </Link>
          )}
        </div>
        {!isDashboard && (
          <div className="navbar-actions">
            <button
              className="btn btn-primary navbar-book-btn"
              onClick={() => {
                if (isHomePage) {
                  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#booking';
                }
              }}
            >
              Book Now
            </button>
            <button
              className="navbar-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="navbar-mobile-menu"
          >
            {navLinks.filter(link => !isDashboard || link.name === 'About').map((link) => (
              link.isHash ? (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    handleNavClick(link.href, true);
                  }}
                  className="navbar-mobile-menu-link"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="navbar-mobile-menu-link"
                >
                  {link.name}
                </Link>
              )
            ))}
            {!isDashboard && (
              <>
                <Link
                  to="/portal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="navbar-mobile-menu-link"
                >
                  Student Portal
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
