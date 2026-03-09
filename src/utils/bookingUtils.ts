// EmailJS Configuration
export const toLocalISOString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};
export const EMAILJS_SERVICE_ID = "service_0x5sd3e";
export const EMAILJS_TEMPLATE_ID = "template_qud6r7d";
export const EMAILJS_MAGIC_LINK_TEMPLATE_ID = "template_7waqf3o";
export const EMAILJS_PUBLIC_KEY = "ZUuklDvmTL5PGUqi_";

export type PaymentMethod = 'Zelle' | 'Venmo' | 'Cash';
export const PAYMENT_METHODS: PaymentMethod[] = ['Zelle', 'Venmo', 'Cash'];

export const instructors = [
    {
        name: "Rob Polan",
        role: "License I2166026",
        email: "alex.rpolan@gmail.com",
        availability: {
            enabled: true,
            days: {
                0: { enabled: false, start: '09:00', end: '17:00' }, // Sun
                1: { enabled: true, start: '09:00', end: '18:00' },  // Mon
                2: { enabled: true, start: '09:00', end: '18:00' },  // Tue
                3: { enabled: true, start: '09:00', end: '18:00' },  // Wed
                4: { enabled: true, start: '09:00', end: '18:00' },  // Thu
                5: { enabled: true, start: '09:00', end: '18:00' },  // Fri
                6: { enabled: false, start: '09:00', end: '17:00' }  // Sat
            },
            excludedDates: [],
            googleScriptUrl: ''
        }
    },
    {
        name: "Natalie Polan",
        role: "License I2166026",
        email: "nataliepolan4@gmail.com",
        availability: {
            enabled: true,
            days: {
                0: { enabled: true, start: '10:00', end: '16:00' }, // Sun
                1: { enabled: false, start: '09:00', end: '17:00' }, // Mon
                2: { enabled: false, start: '09:00', end: '17:00' }, // Tue
                3: { enabled: false, start: '09:00', end: '17:00' }, // Wed
                4: { enabled: false, start: '09:00', end: '17:00' }, // Thu
                5: { enabled: false, start: '09:00', end: '17:00' }, // Fri
                6: { enabled: true, start: '10:00', end: '16:00' }  // Sat
            },
            excludedDates: [],
            googleScriptUrl: ''
        }
    }
];

export const getInstructorConfig = (name: string) => {
    const base = instructors.find(i => i.name === name);
    try {
        const storedStr = localStorage.getItem(`availability_${name}`);
        const stored = storedStr ? JSON.parse(storedStr) : null;
        return stored || base?.availability;
    } catch (e) {
        console.error(`Failed to parse availability for ${name}:`, e);
        return base?.availability;
    }
};

export const generateTimeSlots = (
    date: Date,
    selectedInstructor: string | null,
    googleBusySlots: { [date: string]: { start: string, end: string }[] },
    busySlots: { [instructor: string]: { [date: string]: string[] } }
) => {
    if (!selectedInstructor) return [];
    const config = getInstructorConfig(selectedInstructor);

    // Check if date is blocked (vacations)
    const dateKey = toLocalISOString(date);
    if (config?.excludedDates?.includes(dateKey)) return [];

    const dayOfWeek = date.getDay();
    const dayConfig = config?.days[dayOfWeek];

    if (!dayConfig || !dayConfig.enabled) return [];

    const slots = [];
    let current = new Date(date);
    const [startH, startM] = dayConfig.start.split(':').map(Number);
    const [endH, endM] = dayConfig.end.split(':').map(Number);

    current.setHours(startH, startM, 0, 0);
    const end = new Date(date);
    end.setHours(endH, endM, 0, 0);

    // Lesson is 2 hours, Buffer is 30 mins
    const sessionDuration = 2 * 60 * 60 * 1000;
    const bufferDuration = 30 * 60 * 1000;

    while (current.getTime() + sessionDuration <= end.getTime()) {
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isPastTime = isToday && current.getTime() < now.getTime();

        if (isPastTime) {
            current = new Date(current.getTime() + sessionDuration + bufferDuration);
            continue;
        }

        const timeStr = current.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const googleEvents = googleBusySlots[dateKey] || [];
        const hasConflict = googleEvents.some(event => {
            const eventStart = new Date(`${dateKey}T${event.start}`);
            const eventEnd = new Date(`${dateKey}T${event.end}`);
            const slotStart = current;
            const slotEnd = new Date(current.getTime() + sessionDuration);
            return (slotStart < eventEnd && slotEnd > eventStart);
        });

        // Use a consistent key for checking local leads (which use toLocaleDateString in some versions, but let's standardize on ISO)
        // Wait, checking AdminDashboard: localStorage.getItem('driving_leads') uses Lead object which has 'date' string.
        // Let's ensure BookingCalendar and StudentPortal save with consistent format.
        const isLocallyBusy = busySlots[selectedInstructor]?.[dateKey]?.includes(timeStr);

        if (!hasConflict && !isLocallyBusy) {
            slots.push(timeStr);
        }

        current = new Date(current.getTime() + sessionDuration + bufferDuration);
    }

    return slots;
};

export const isMinor = (birthdate: string) => {
    if (!birthdate) return false;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age < 18;
};

export const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phone = value.replace(/\D/g, '');
    const phoneLength = phone.length;
    if (phoneLength < 4) return phone;
    if (phoneLength < 7) {
        return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    }
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
};

export const getDaysInMonth = (month: Date) => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1).getDay();
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, m, i));
    return days;
};

export const isCancellationLate = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return { isLate: false, isPast: false, hoursRemaining: 0 };

    // Standardize time parsing (e.g., "09:00 AM")
    try {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const lessonDate = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
        const now = new Date();

        const diffMs = lessonDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        return {
            isLate: diffHours < 24 && diffHours > 0,
            isPast: diffHours <= 0,
            hoursRemaining: Math.max(0, diffHours)
        };
    } catch (e) {
        return { isLate: false, isPast: false, hoursRemaining: 0 };
    }
};
export const isLessonPast = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return false;

    try {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const lessonDate = parseLocalDate(dateStr);
        lessonDate.setHours(hours, minutes, 0, 0);

        // Lessons are typically 2 hours. Consider it 'past' once it has ended.
        const lessonEndDate = new Date(lessonDate.getTime() + (2 * 60 * 60 * 1000));
        return lessonEndDate.getTime() <= Date.now();
    } catch (e) {
        return false;
    }
};
