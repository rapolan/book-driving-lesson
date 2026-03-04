import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  Calendar,
  User,
  Users,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CreditCard,
  Mail,
  Phone,
  Hash,
  Navigation,
  Ticket,
} from "lucide-react";
import emailjs from "@emailjs/browser";
import {
  instructors,
  getInstructorConfig,
  generateTimeSlots as baseGenerateTimeSlots,
  isMinor,
  formatPhoneNumber,
  toLocalISOString,
  parseLocalDate,
  type PaymentMethod,
  PAYMENT_METHODS,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
} from "../utils/bookingUtils";

const BookingCalendar: React.FC = () => {
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [bookingStep, setBookingStep] = useState(0); // 0: Instructor, 1: Selection, 2: Form, 3: Success
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    permitNumber: "",
    pickupLocation: "",
    paymentMethod: "" as PaymentMethod | "",
    guardians: [{ name: "", phone: "", email: "" }],
    referralCode: "",
  });
  const [busySlots, setBusySlots] = useState<{
    [instructor: string]: { [date: string]: string[] };
  }>({});
  const [googleBusySlots, setGoogleBusySlots] = useState<{
    [date: string]: { start: string; end: string }[];
  }>({});
  const [isSyncing, setIsSyncing] = useState(false);

  // New local state for split address fields
  const [pickupType, setPickupType] = useState<"address" | "school">("address");
  const [pickupAddress, setPickupAddress] = useState({
    street: "",
    city: "",
    zip: "",
    schoolName: "",
  });

  // Update formData whenever separate fields change
  useEffect(() => {
    const { street, city, zip, schoolName } = pickupAddress;

    if (pickupType === "address") {
      if (street || city || zip) {
        setFormData((prev) => ({
          ...prev,
          pickupLocation: `${street}, ${city} ${zip}`,
        }));
      }
    } else {
      if (schoolName) {
        setFormData((prev) => ({
          ...prev,
          pickupLocation: schoolName,
        }));
      }
    }
  }, [pickupAddress, pickupType]);

  useEffect(() => {
    const simulateFetch = () => {
      const localLeads = JSON.parse(
        localStorage.getItem("driving_leads") || "[]",
      );
      const busy: { [instructor: string]: { [date: string]: string[] } } = {
        "Rob Polan": {},
        "Natalie Polan": {},
      };

      localLeads.forEach((lead: any) => {
        const instr = lead.instructor || "Rob Polan";
        if (!busy[instr]) busy[instr] = {};
        if (!busy[instr][lead.date]) busy[instr][lead.date] = [];
        busy[instr][lead.date].push(lead.time);
      });

      setBusySlots(busy);
    };

    simulateFetch();

    // Check for pending referral
    const pendingRef = localStorage.getItem("school_pending_referral");
    if (pendingRef) {
      setFormData((prev) => ({ ...prev, referralCode: pendingRef }));
    }
  }, []);

  const getDaysInMonth = (month: Date) => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1).getDay();
    const daysInMonth = new Date(year, m + 1, 0).getDate();

    const days = [];
    // Add padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, m, i));
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const prevMonth = () => {
    const now = new Date();
    const prev = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1,
    );
    if (
      prev.getMonth() >= now.getMonth() ||
      prev.getFullYear() > now.getFullYear()
    ) {
      setCurrentMonth(prev);
    }
  };

  const generateTimeSlots = (date: Date) => {
    return baseGenerateTimeSlots(
      date,
      selectedInstructor,
      googleBusySlots,
      busySlots,
    );
  };

  const fetchGoogleAvailability = async (date: Date) => {
    if (!selectedInstructor) return;
    const config = getInstructorConfig(selectedInstructor);
    if (!config?.googleScriptUrl) {
      setGoogleBusySlots({});
      return;
    }

    setIsSyncing(true);
    const dateStr = toLocalISOString(date);
    try {
      const response = await fetch(`${config.googleScriptUrl}?date=${dateStr}`);
      const data = await response.json();
      setGoogleBusySlots((prev) => ({ ...prev, [dateStr]: data }));
    } catch (error) {
      console.error("Failed to sync with Google Calendar:", error);
      setGoogleBusySlots({});
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchGoogleAvailability(parseLocalDate(selectedDate));
    }
  }, [selectedDate, selectedInstructor]);

  const sendToGoogleCalendar = async (
    studentData: typeof formData,
    appointment: { date: string; time: string },
  ) => {
    if (!selectedInstructor) return;
    const config = getInstructorConfig(selectedInstructor);
    if (!config?.googleScriptUrl) return;

    // Calculate end time (2 hours later)
    const start = new Date(`${appointment.date} ${appointment.time}`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    // Format guardians for calendar event

    const guardianInfo =
      isMinor(studentData.birthdate) && studentData.guardians.length > 0
        ? studentData.guardians
          .map((g) => `${g.name} - ${g.phone} (${g.email})`)
          .join("; ")
        : "N/A";

    const payload = {
      studentName: studentData.name,
      studentEmail: studentData.email,
      studentPhone: studentData.phone,
      pickupLocation: studentData.pickupLocation,
      paymentMethod: studentData.paymentMethod,
      permit: studentData.permitNumber,
      guardians: guardianInfo,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };

    try {
      await fetch(config.googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("? Failed to push to Google Calendar:", error);
    }
  };

  const sendBookingEmail = async (
    instructor: string,
    studentData: typeof formData,
    appointment: { date: string; time: string },
  ) => {
    const instructorEmail = instructors.find(
      (i) => i.name === instructor,
    )?.email;

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: instructorEmail,
          instructor_name: instructor,
          student_name: studentData.name,
          student_email: studentData.email,
          student_phone: studentData.phone,
          student_birthdate: studentData.birthdate,
          student_permit: studentData.permitNumber,
          pickup_location: studentData.pickupLocation,
          payment_method: studentData.paymentMethod,
          appointment_date: appointment.date,
          appointment_time: appointment.time,
          guardians: isMinor(formData.birthdate)
            ? studentData.guardians
              .map((g) => `${g.name} (${g.phone}, ${g.email})`)
              .join(", ")
            : "N/A",
        },
        EMAILJS_PUBLIC_KEY,
      );
    } catch (error) {
      console.error("FAILED...", error);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedDate !== null && selectedTime) {
      setBookingStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate === null) return;

    if (!formData.paymentMethod) {
      alert(
        "Please select a payment method (Zelle, Venmo, or Cash) to proceed.",
      );
      return;
    }

    const appointmentDate = selectedDate!;
    const appointment = { date: appointmentDate, time: selectedTime! };

    // Save Lead locally
    const newLead = {
      ...formData,
      instructor: selectedInstructor,
      date: appointmentDate,
      time: selectedTime,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const existingLeads = JSON.parse(
      localStorage.getItem("driving_leads") || "[]",
    );
    localStorage.setItem(
      "driving_leads",
      JSON.stringify([...existingLeads, newLead]),
    );

    // Sync with external services
    await sendBookingEmail(selectedInstructor!, formData, appointment);
    await sendToGoogleCalendar(formData, appointment);

    setBookingStep(3);
  };

  const handleBack = () => {
    if (bookingStep > 0) setBookingStep(bookingStep - 1);
    if (bookingStep === 1) {
      setSelectedInstructor(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  const updateGuardian = (index: number, field: string, value: string) => {
    const newGuardians = [...formData.guardians];
    (newGuardians[index] as any)[field] = value;
    setFormData({ ...formData, guardians: newGuardians });
  };

  const addGuardian = () => {
    setFormData({
      ...formData,
      guardians: [...formData.guardians, { name: "", phone: "", email: "" }],
    });
  };

  const removeGuardian = (index: number) => {
    const newGuardians = formData.guardians.filter((_, i) => i !== index);
    setFormData({ ...formData, guardians: newGuardians });
  };

  return (
    <section id="booking" className="section container">
      <div className="text-center mb-5">
        <h2 className="booking-title mb-4">
          <span className="gradient-text">Reserve Your Session</span>
        </h2>
        <p
          className="body-large text-secondary"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          Expert instruction tailored to your schedule. Start your journey with
          confidence.
        </p>
        <p className="mt-3 small" style={{ color: "var(--text-secondary)" }}>
          Returning student?{" "}
          <a
            href="/portal"
            style={{
              color: "var(--primary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Login here
          </a>{" "}
          to schedule your next lesson.
        </p>
      </div>

      <div className="card-layered textured textured-asphalt booking-container">
        {/* Road Stepper */}
        <div className="road-stepper">
          <div className="road-stepper-line">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(bookingStep / 3) * 100}%` }}
              className="road-stepper-progress"
              transition={{ duration: 0.5 }}
            />
          </div>

          <div
            className="d-flex justify-content-between align-items-center position-relative"
            style={{ zIndex: 1 }}
          >
            {[0, 1, 2, 3].map((step) => {
              const stepNames = ["Instructor", "Schedule", "Details", "Done"];
              const isActive = bookingStep >= step;
              const isCompleted = bookingStep > step;

              return (
                <div key={step} className="step-item">
                  <div className="position-relative mb-2">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isActive
                          ? "var(--primary)"
                          : "var(--bg-secondary)",
                        borderColor: isActive
                          ? "var(--primary)"
                          : "var(--glass-border)",
                        color: isActive ? "white" : "var(--text-secondary)",
                      }}
                      className={`step-circle ${isActive ? "active" : ""}`}
                      onClick={() => step < bookingStep && setBookingStep(step)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isCompleted ? <CheckCircle size={22} /> : step + 1}
                    </motion.div>
                  </div>
                  <span className={`step-label ${isActive ? "active" : ""}`}>
                    {stepNames[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {bookingStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="h4 mb-4" style={{ fontFamily: "Outfit" }}>
                Select Your Instructor
              </h3>
              <div className="school-instructor-grid">
                {instructors.map((instructor) => (
                  <motion.button
                    key={instructor.name}
                    onClick={() => {
                      setSelectedInstructor(instructor.name);
                      setBookingStep(1);
                    }}
                    className={`school-instructor-card ${selectedInstructor === instructor.name ? "active" : ""}`}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="school-instructor-avatar">
                      <User size={32} />
                    </div>
                    <div>
                      <div
                        className="fw-bold"
                        style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}
                      >
                        {instructor.name}
                      </div>
                      <div className="text-secondary small">
                        {instructor.role}
                      </div>
                    </div>
                    {selectedInstructor === instructor.name && (
                      <motion.div
                        layoutId="activeInstructor"
                        className="position-absolute border border-2 border-primary rounded-pill"
                        style={{
                          top: 10,
                          right: 10,
                          width: 10,
                          height: 10,
                          background: "var(--primary)",
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {bookingStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <h3 className="h4" style={{ fontFamily: "Outfit" }}>
                  Choose Date & Time
                </h3>
                <div className="d-flex align-items-center gap-2 text-secondary small">
                  {isSyncing ? (
                    <div
                      className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--glass-border)",
                      }}
                    >
                      <Loader2 size={14} className="animate-spin" />
                      <span>Syncing...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        selectedDate &&
                        fetchGoogleAvailability(parseLocalDate(selectedDate))
                      }
                      className="btn-sync-pill"
                    >
                      <CheckCircle size={14} />
                      Live Availability (Refresh)
                    </button>
                  )}
                </div>
              </div>
              <div className="calendar-card-premium mb-4">
                <div className="calendar-header mb-4">
                  <h4 className="h5 m-0 fw-bold text-capitalize">
                    {currentMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>
                  <div className="d-flex gap-2">
                    <button onClick={prevMonth} className="btn-circle">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="btn-circle">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="calendar-grid">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="calendar-day-header"
                        style={{ fontWeight: 800 }}
                      >
                        {day}
                      </div>
                    ),
                  )}
                  {getDaysInMonth(currentMonth).map((date, i) => {
                    if (!date)
                      return (
                        <div
                          key={`empty-${i}`}
                          className="calendar-cell outside"
                        />
                      );

                    const dateKey = toLocalISOString(date);
                    const isSelected = selectedDate === dateKey;
                    const isToday =
                      toLocalISOString(date) === toLocalISOString(new Date());
                    const isPast =
                      date < new Date(new Date().setHours(0, 0, 0, 0));
                    const hasAvail =
                      !isPast && generateTimeSlots(date).length > 0;

                    return (
                      <button
                        key={dateKey}
                        disabled={isPast}
                        onClick={() => {
                          setSelectedDate(dateKey);
                          setSelectedTime(null);
                        }}
                        className={`calendar-cell ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${hasAvail ? "has-avail" : ""}`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
                <div className="availability-legend">
                  <span className="legend-dot"></span>
                  <span>Available Days</span>
                </div>
              </div>

              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <label
                    className="form-label d-block mb-3"
                    style={{ fontSize: "0.9rem", opacity: 0.8 }}
                  >
                    Available Times (2-Hour Lessons)
                  </label>
                  <div className="grid grid-2 grid-4 gap-3">
                    {generateTimeSlots(parseLocalDate(selectedDate)).length >
                      0 ? (
                      generateTimeSlots(parseLocalDate(selectedDate)).map(
                        (time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`time-chip flex-column gap-1 align-items-center justify-content-center p-3 ${selectedTime === time ? "active" : ""}`}
                          >
                            <div className="fw-bold d-flex align-items-center gap-2">
                              <Clock size={16} />
                              {time}
                            </div>
                            <div className="small opacity-75 fw-normal">
                              ${parseLocalDate(selectedDate).getDay() === 0 || parseLocalDate(selectedDate).getDay() === 6 ? '160' : '140'}
                            </div>
                          </button>
                        ),
                      )
                    ) : (
                      <div
                        className="col-span-all text-center p-4 rounded-3"
                        style={{
                          background: "rgba(0,0,0,0.05)",
                          border: "1px dashed var(--glass-border)",
                        }}
                      >
                        <p className="text-secondary m-0">
                          No availability for this date.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              <div className="d-flex gap-3 mt-5">
                <button
                  onClick={handleBack}
                  className="btn btn-secondary flex-grow-1"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmSelection}
                  disabled={!selectedTime}
                  className="btn btn-primary flex-grow-1"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {bookingStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="h4 mb-4" style={{ fontFamily: "Outfit" }}>
                Complete Registration
              </h3>
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                {/* Student Details Card */}
                <div className="card-layered textured-asphalt bg-white p-4">
                  <h4 className="h5 mb-4 d-flex align-items-center gap-2">
                    <User size={20} className="text-primary" /> Student Details
                  </h4>
                  <div className="grid grid-2 gap-4">
                    <div className="school-input-group">
                      <label className="form-label text-uppercase small fw-bold text-secondary" style={{ letterSpacing: '0.05em' }}>Full Name</label>
                      <div className="position-relative">
                        <User size={18} className="position-absolute text-secondary" style={{ top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                        <input
                          type="text"
                          className="school-input"
                          style={{ paddingLeft: '2.8rem' }}
                          placeholder="Legal First & Last Name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="school-input-group">
                      <label className="form-label text-uppercase small fw-bold text-secondary" style={{ letterSpacing: '0.05em' }}>Email Address</label>
                      <div className="position-relative">
                        <Mail size={18} className="position-absolute text-secondary" style={{ top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                        <input
                          type="email"
                          className="school-input"
                          style={{ paddingLeft: '2.8rem' }}
                          placeholder="student@example.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="school-input-group">
                      <label className="form-label text-uppercase small fw-bold text-secondary" style={{ letterSpacing: '0.05em' }}>Phone Number</label>
                      <div className="position-relative">
                        <Phone size={18} className="position-absolute text-secondary" style={{ top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                        <input
                          type="tel"
                          className="school-input"
                          style={{ paddingLeft: '2.8rem' }}
                          placeholder="(555) 555-5555"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="school-input-group">
                      <label className="form-label text-uppercase small fw-bold text-secondary" style={{ letterSpacing: '0.05em' }}>Birthdate</label>
                      <div className="position-relative">
                        <Calendar size={18} className="position-absolute text-secondary" style={{ top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                        <input
                          type="date"
                          className="school-input"
                          style={{ paddingLeft: '2.8rem' }}
                          required
                          value={formData.birthdate}
                          onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="school-input-group span-2" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label text-uppercase small fw-bold text-secondary" style={{ letterSpacing: '0.05em' }}>Learner's Permit #</label>
                      <div className="position-relative">
                        <Hash size={18} className="position-absolute text-secondary" style={{ top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                        <input
                          type="text"
                          className="school-input"
                          style={{ paddingLeft: '2.8rem' }}
                          placeholder="Permit/License Number"
                          required
                          value={formData.permitNumber}
                          onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logistics Card */}
                <div className="card-layered textured-asphalt bg-white p-4">
                  <h4 className="h5 mb-4 d-flex align-items-center gap-2">
                    <MapPin size={20} className="text-primary" /> Logistics & Location
                  </h4>
                  <div className="school-input-group mb-0">
                    <label className="form-label text-uppercase small fw-bold text-secondary mb-3" style={{ letterSpacing: '0.05em' }}>Pickup Location</label>
                    <div
                      className="d-flex gap-2 mb-4 p-1 bg-secondary-subtle rounded-3 border"
                      style={{ borderColor: "var(--glass-border)" }}
                    >
                      <button
                        type="button"
                        onClick={() => setPickupType("address")}
                        className={`flex-grow-1 small ${pickupType === "address" ? "shadow-sm text-white fw-bold" : "text-secondary hover-text-primary"}`}
                        style={{
                          borderRadius: "0.5rem",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          padding: "0.75rem",
                          background: pickupType === "address" ? "var(--primary)" : "transparent",
                          color: pickupType === "address" ? "white" : "inherit"
                        }}
                      >
                        Home Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickupType("school")}
                        className={`flex-grow-1 small ${pickupType === "school" ? "shadow-sm text-white fw-bold" : "text-secondary hover-text-primary"}`}
                        style={{
                          borderRadius: "0.5rem",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          padding: "0.75rem",
                          background: pickupType === "school" ? "var(--primary)" : "transparent",
                          color: pickupType === "school" ? "white" : "inherit"
                        }}
                      >
                        School Pickup
                      </button>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {pickupType === "address" ? (
                        <>
                          <div className="position-relative">
                            <Navigation size={18} className="position-absolute text-secondary" style={{ top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                            <input
                              type="text"
                              className="school-input"
                              style={{ paddingLeft: '2.8rem' }}
                              placeholder="Street Address (e.g. 123 Main St)"
                              value={pickupAddress.street}
                              onChange={(e) => setPickupAddress({ ...pickupAddress, street: e.target.value })}
                              required={pickupType === "address"}
                            />
                          </div>
                          <div className="d-flex gap-3">
                            <input
                              type="text"
                              className="school-input"
                              placeholder="City"
                              value={pickupAddress.city}
                              onChange={(e) => setPickupAddress({ ...pickupAddress, city: e.target.value })}
                              required={pickupType === "address"}
                              style={{ flex: 3 }}
                            />
                            <input
                              type="text"
                              className="school-input text-center px-1"
                              placeholder="State"
                              defaultValue="CA"
                              required={pickupType === "address"}
                              style={{ flex: 1, minWidth: '60px' }}
                            />
                            <input
                              type="text"
                              className="school-input"
                              placeholder="Zip Code"
                              value={pickupAddress.zip}
                              onChange={(e) => setPickupAddress({ ...pickupAddress, zip: e.target.value })}
                              required={pickupType === "address"}
                              style={{ flex: 2 }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="position-relative">
                          <Navigation size={18} className="position-absolute text-secondary" style={{ top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                          <input
                            type="text"
                            className="school-input"
                            style={{ paddingLeft: '2.8rem' }}
                            placeholder="School Name (e.g. Eastlake High)"
                            value={pickupAddress.schoolName}
                            onChange={(e) => setPickupAddress({ ...pickupAddress, schoolName: e.target.value })}
                            required={pickupType === "school"}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Checkout Card */}
                <div className="card-layered textured-asphalt bg-white p-4">
                  <h4 className="h5 mb-4 d-flex align-items-center gap-2">
                    <CreditCard size={20} className="text-primary" /> Checkout
                  </h4>

                  <div className="school-input-group mb-5">
                    <label className="form-label text-uppercase small fw-bold text-secondary d-flex justify-content-between align-items-center" style={{ letterSpacing: '0.05em' }}>
                      <span>Referral Code</span>
                    </label>
                    <div className="position-relative">
                      <Ticket size={18} className="position-absolute text-secondary" style={{ top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                      <input
                        type="email"
                        className="school-input"
                        style={{ paddingLeft: '2.8rem' }}
                        placeholder="Friend's email (Optional)"
                        value={formData.referralCode}
                        onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                      />
                    </div>
                    {formData.referralCode && (
                      <div className="text-accent small mt-2 fw-bold d-flex align-items-center gap-1">
                        <CheckCircle size={14} /> Referral applied! You save $10.
                      </div>
                    )}
                  </div>

                  <div className="school-input-group mb-0">
                    <label className="form-label text-uppercase small fw-bold text-secondary mb-3" style={{ letterSpacing: '0.05em' }}>Payment Method</label>
                    <div className="d-flex flex-wrap gap-3 mb-4">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: method })}
                          className={`btn text-start d-flex justify-content-between align-items-center flex-grow-1 border ${formData.paymentMethod === method ? "border-primary bg-primary text-white" : "border-glass"}`}
                          style={{
                            cursor: "pointer",
                            background: formData.paymentMethod === method ? "var(--primary)" : "var(--bg-primary)",
                            color: formData.paymentMethod === method ? "white" : "inherit",
                            borderWidth: formData.paymentMethod === method ? "2px" : "1px",
                            transition: "all 0.2s",
                            padding: "1rem 1.25rem",
                            borderRadius: "1rem",
                            boxShadow: formData.paymentMethod === method ? "var(--shadow-md)" : "none"
                          }}
                        >
                          <span className="fw-bold fs-6">{method}</span>
                          {formData.paymentMethod === method && (
                            <CheckCircle size={20} className="text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div
                      className="d-flex align-items-start gap-2 p-3 bg-secondary-subtle rounded-3 text-secondary small border"
                      style={{ borderColor: "var(--glass-border)" }}
                    >
                      <AlertCircle size={16} className="text-primary mt-1 flex-shrink-0" />
                      <div>
                        <strong>Note:</strong> Payment will be collected in person before the lesson begins.
                      </div>
                    </div>
                  </div>
                </div>

                {isMinor(formData.birthdate) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-3 textured-asphalt bg-secondary-subtle border border-glass"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="h5 m-0 d-flex align-items-center gap-2">
                        <Users size={20} className="text-primary" /> Guardian
                        Information
                      </h4>
                      <button
                        type="button"
                        onClick={addGuardian}
                        className="btn btn-secondary btn-sm"
                      >
                        Add Guardian
                      </button>
                    </div>
                    {formData.guardians.map((guardian, index) => (
                      <div
                        key={index}
                        className="mb-4 pb-4 border-bottom last-child-no-border"
                      >
                        <div className="grid grid-3 gap-3">
                          <input
                            placeholder="Guardian Name"
                            className="school-input"
                            value={guardian.name}
                            onChange={(e) =>
                              updateGuardian(index, "name", e.target.value)
                            }
                            required
                          />
                          <input
                            placeholder="Phone"
                            className="school-input"
                            value={guardian.phone}
                            onChange={(e) =>
                              updateGuardian(
                                index,
                                "phone",
                                formatPhoneNumber(e.target.value),
                              )
                            }
                            required
                          />
                          <div className="d-flex gap-2">
                            <input
                              placeholder="Email"
                              type="email"
                              className="school-input flex-grow-1"
                              value={guardian.email}
                              onChange={(e) =>
                                updateGuardian(index, "email", e.target.value)
                              }
                              required
                            />
                            {formData.guardians.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeGuardian(index)}
                                className="btn btn-secondary"
                              >
                                �
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                <div className="d-flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-secondary flex-grow-1"
                  >
                    Back
                  </button>
                  <motion.button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Confirm Booking
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {bookingStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-5"
            >
              <div className="success-icon-container">
                <CheckCircle size={56} strokeWidth={2.5} />
              </div>
              <h3
                className="display-small mb-3"
                style={{ fontFamily: "Outfit" }}
              >
                Success! You're Booked.
              </h3>
              <p
                className="body-large text-secondary mb-5"
                style={{ maxWidth: "500px", margin: "0 auto 3rem" }}
              >
                We're excited to help you get on the road. A confirmation email
                has been sent to <strong>{formData.email}</strong>.
              </p>

              <div className="card-layered textured-asphalt success-card">
                <div className="success-detail-item">
                  <div className="success-detail-icon">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div
                      className="text-secondary small text-uppercase fw-bold mb-1"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      Lesson Date
                    </div>
                    <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
                      {new Date(selectedDate! + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { weekday: "long", month: "long", day: "numeric" },
                      )}
                    </div>
                    <div className="text-secondary">
                      {selectedTime} (2-Hour Session)
                    </div>
                  </div>
                </div>

                <div className="success-detail-item">
                  <div className="success-detail-icon">
                    <User size={24} />
                  </div>
                  <div>
                    <div
                      className="text-secondary small text-uppercase fw-bold mb-1"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      Instructor
                    </div>
                    <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
                      {selectedInstructor}
                    </div>
                  </div>
                </div>

                <div className="success-detail-item mb-0">
                  <div className="success-detail-icon">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div
                      className="text-secondary small text-uppercase fw-bold mb-1"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      Pickup Point
                    </div>
                    <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
                      {formData.pickupLocation}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 d-flex gap-3 justify-content-center">
                <motion.button
                  onClick={() => {
                    setBookingStep(0);
                    setSelectedInstructor(null);
                    setSelectedDate(null);
                    setSelectedTime(null);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      birthdate: "",
                      permitNumber: "",
                      pickupLocation: "",
                      paymentMethod: "",
                      guardians: [{ name: "", phone: "", email: "" }],
                      referralCode:
                        localStorage.getItem("school_pending_referral") || "",
                    });
                  }}
                  className="btn btn-secondary"
                  style={{ padding: "1rem 2rem" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Another
                </motion.button>
                <motion.button
                  onClick={() => (window.location.href = "/portal")}
                  className="btn btn-primary"
                  style={{ padding: "1rem 2rem" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Go to Student Portal
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default BookingCalendar;
