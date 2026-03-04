import { Car } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components/Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

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
          <div className="navbar-actions">
            <Link
              to="/portal"
              className="navbar-login-link"
            >
              Login
            </Link>
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
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
