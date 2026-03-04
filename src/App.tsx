import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import GuideSection from './components/GuideSection';
import PlanSection from './components/PlanSection';
import SuccessSection from './components/SuccessSection';
import BookingCalendar from './components/BookingCalendar';
import PermitGuide from './components/PermitGuide';
import About from './components/About';
import PlanPage from './components/PlanPage';
import AdminDashboard from './components/AdminDashboard';
import StudentPortal from './components/StudentPortal';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './styles/components/App.css';

const RoadCurve = ({ direction }: { direction: 'left' | 'right' }) => (
  <div className="container road-curve-container">
    <svg
      width="100%"
      height="150"
      viewBox="0 0 1200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`road-curve-svg ${direction === 'left' ? 'road-curve-svg-left' : 'road-curve-svg-right'}`}
    >
      <path
        d={direction === 'left' ? "M1200 100 Q600 0 0 100" : "M0 100 Q600 0 1200 100"}
        stroke="var(--road-grey)"
        strokeWidth="4"
        className="road-path-animated"
      />
    </svg>
  </div>
);

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        const id = window.location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small delay to wait for render
    } else {
      window.scrollTo(0, 0);
    }

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('school_pending_referral', ref);
    }
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <RoadCurve direction="left" />
              <ProblemSection />
              <GuideSection />
              <RoadCurve direction="right" />
              <PlanSection />
              <SuccessSection />
              <BookingCalendar />
            </>
          } />
          <Route path="/permit-guide" element={<PermitGuide />} />
          <Route path="/about" element={<About />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/admin-school" element={<AdminDashboard />} />
          <Route path="/portal" element={<StudentPortal />} />
        </Routes>
      </main>
      <footer className="section app-footer">
        <div className="container">
          <p className="app-footer-text">
            © 2026 DrivingLesson.Me • Licensed & Insured Professional Driving Instructors
          </p>
          <p className="app-footer-subtext">
            Partnered with Budget Driving School LLC.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
