import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, toLocalISOString } from '../../utils/bookingUtils';

interface CalendarGridProps {
    currentMonth: Date;
    selectedDate: string | null;
    onDateSelect: (dateKey: string) => void;
    onMonthChange: (direction: 'next' | 'prev') => void;
    generateTimeSlots: (date: Date) => string[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
    currentMonth,
    selectedDate,
    onDateSelect,
    onMonthChange,
    generateTimeSlots
}) => {
    const days = getDaysInMonth(currentMonth);
    const todayISO = toLocalISOString(new Date());

    return (
        <div className="calendar-card-premium mb-4">
            <div className="calendar-header mb-4">
                <h4 className="h5 m-0 fw-bold text-capitalize">
                    {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                    })}
                </h4>
                <div className="d-flex gap-2">
                    <button
                        onClick={() => onMonthChange('prev')}
                        className="btn-circle"
                        disabled={currentMonth.getTime() <= new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()}
                        style={{ opacity: currentMonth.getTime() <= new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() ? 0.3 : 1 }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => onMonthChange('next')}
                        className="btn-circle"
                        disabled={currentMonth.getTime() >= new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime()}
                        style={{ opacity: currentMonth.getTime() >= new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime() ? 0.3 : 1 }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="calendar-day-header" style={{ fontWeight: 800 }}>
                        {day}
                    </div>
                ))}
                {days.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} className="calendar-cell outside" />;

                    const dateKey = toLocalISOString(date);
                    const isSelected = selectedDate === dateKey;
                    const isToday = dateKey === todayISO;
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                    const hasAvail = !isPast && generateTimeSlots(date).length > 0;

                    return (
                        <button
                            key={dateKey}
                            disabled={isPast}
                            onClick={() => onDateSelect(dateKey)}
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
    );
};

export default CalendarGrid;
