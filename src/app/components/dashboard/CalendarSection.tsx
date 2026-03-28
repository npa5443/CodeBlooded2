import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  students: number;
}

interface CalendarSectionProps {
  course: Course;
}

interface CalendarEvent {
  id: string;
  title: string;
  type: "lecture" | "exam" | "deadline" | "office-hours" | "holiday";
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
}

export function CalendarSection({ course }: CalendarSectionProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 28)); // March 28, 2026
  const [view, setView] = useState<"month" | "week">("month");

  // Mock events
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Lecture 10: Binary Search Trees",
      type: "lecture",
      date: new Date(2026, 2, 29),
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      location: "Hall B-204",
    },
    {
      id: "2",
      title: "Lab Session 9",
      type: "lecture",
      date: new Date(2026, 2, 30),
      startTime: "2:00 PM",
      endTime: "3:30 PM",
      location: "Computer Lab 3",
    },
    {
      id: "3",
      title: "Assignment 5 Due",
      type: "deadline",
      date: new Date(2026, 2, 30),
      startTime: "11:59 PM",
    },
    {
      id: "4",
      title: "Midterm Exam",
      type: "exam",
      date: new Date(2026, 3, 3),
      startTime: "9:00 AM",
      endTime: "11:00 AM",
      location: "Main Auditorium",
    },
    {
      id: "5",
      title: "Office Hours",
      type: "office-hours",
      date: new Date(2026, 3, 2),
      startTime: "3:00 PM",
      endTime: "5:00 PM",
      location: "Office 401",
    },
    {
      id: "6",
      title: "Spring Break",
      type: "holiday",
      date: new Date(2026, 3, 13),
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = getDaysInMonth(currentDate);
  const today = new Date(2026, 2, 28); // Current date in the app

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "lecture":
        return "bg-blue-500";
      case "exam":
        return "bg-red-500";
      case "deadline":
        return "bg-orange-500";
      case "office-hours":
        return "bg-green-500";
      case "holiday":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventBadge = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "lecture":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Lecture</Badge>;
      case "exam":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Exam</Badge>;
      case "deadline":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Deadline</Badge>;
      case "office-hours":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Office Hours</Badge>;
      case "holiday":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Holiday</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="text-2xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setCurrentDate(today)}>
            Today
          </Button>
          <Button>
            <Plus className="size-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isToday =
                  date &&
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 rounded-lg border transition-all ${
                      !date
                        ? "bg-gray-50 border-transparent"
                        : isToday
                        ? "bg-indigo-50 border-indigo-500 border-2"
                        : "bg-white border-gray-200 hover:border-gray-300 cursor-pointer"
                    }`}
                  >
                    {date && (
                      <>
                        <div
                          className={`text-sm font-medium mb-1 ${
                            isToday ? "text-indigo-700" : "text-gray-900"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs px-1.5 py-1 rounded ${getEventColor(
                                event.type
                              )} text-white truncate`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-600 px-1.5">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events
                .filter((event) => event.date >= today)
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`size-2 rounded-full ${getEventColor(event.type)} mt-1.5`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h4>
                        {getEventBadge(event.type)}
                      </div>
                    </div>
                    <div className="space-y-1 ml-5">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CalendarIcon className="size-3" />
                        <span>
                          {event.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {event.startTime && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="size-3" />
                          <span>
                            {event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="size-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-700">Lectures</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-700">Exams</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-orange-500" />
              <span className="text-sm text-gray-700">Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-700">Office Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-purple-500" />
              <span className="text-sm text-gray-700">Holidays</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
