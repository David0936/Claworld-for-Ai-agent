"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "cron" | "session" | "system";
  description?: string;
}

function getWeekDates(offset = 0): Date[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDate(d: Date): string {
  return d.toISOString().substring(0, 10);
}

function isToday(d: Date): boolean {
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

const typeColors: Record<string, string> = {
  cron: "var(--warning)",
  session: "var(--info)",
  system: "var(--accent)",
};

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>([]);

  const dates = getWeekDates(weekOffset);
  const today = new Date().toISOString().substring(0, 10);
  const currentYear = dates[0].getFullYear();
  const currentMonth = dates[0].getMonth() + 1;
  const monthKey = `${currentYear}-${currentMonth}`;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calendar?year=${currentYear}&month=${currentMonth}`)
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  useEffect(() => {
    const dateSet = new Set(dates.map(formatDate));
    setCurrentEvents(events.filter((e) => dateSet.has(e.date)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, weekOffset]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            Calendar
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {dates[0].toLocaleDateString("en-US", { month: "long", year: "numeric" })} ·{" "}
            {currentEvents.length} event{currentEvents.length !== 1 ? "s" : ""} this week
          </p>
        </div>

        {/* Week navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: weekOffset === 0 ? "var(--accent-soft)" : "var(--surface)",
              color: weekOffset === 0 ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        {dates.map((date, i) => {
          const dateStr = formatDate(date);
          const dayEvents = currentEvents.filter((e) => e.date === dateStr);
          const todayFlag = isToday(date);
          return (
            <div
              key={i}
              style={{
                borderRadius: "var(--radius-lg)",
                border: todayFlag ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                background: todayFlag ? "var(--accent-soft)" : "var(--surface)",
                overflow: "hidden",
              }}
            >
              {/* Day header */}
              <div
                style={{
                  padding: "8px",
                  textAlign: "center",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {dayNames[i]}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: todayFlag ? "var(--accent)" : "var(--text-primary)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {date.getDate()}
                </div>
              </div>

              {/* Events */}
              <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: "4px", minHeight: "60px" }}>
                {loading && i === 0 && (
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>...</div>
                )}
                {!loading && dayEvents.length === 0 && (
                  <div style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center", padding: "4px" }}>
                    —
                  </div>
                )}
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    title={event.description}
                    style={{
                      fontSize: "9px",
                      padding: "3px 5px",
                      borderRadius: "4px",
                      background: `${typeColors[event.type] || "var(--accent)"}20`,
                      color: typeColors[event.type] || "var(--accent)",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "default",
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center" }}>
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event list */}
      {currentEvents.length > 0 && (
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <CalendarDays size={14} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              This Week&apos;s Events
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {currentEvents
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((event) => (
                <div
                  key={event.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-elevated)",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: typeColors[event.type] || "var(--accent)",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {event.title}
                    </div>
                    {event.description && (
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {event.description}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", flexShrink: 0 }}>
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {event.time && ` · ${event.time}`}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
