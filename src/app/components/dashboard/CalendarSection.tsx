import { format, isSameDay, isToday } from "date-fns";
import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
} from "lucide-react";
import type { CalendarEvent, CalendarEventType } from "../../lib/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface CalendarSectionProps {
  events: CalendarEvent[];
  onAddEvent: (payload: {
    title: string;
    type: CalendarEventType;
    startAt: string;
    endAt?: string;
    location?: string;
    description?: string;
  }) => Promise<void>;
}

function combineDateAndTime(date: string, time?: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = (time ?? "12:00").split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

export function CalendarSection({ events, onAddEvent }: CalendarSectionProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    type: "lecture" as CalendarEventType,
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
  });

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (left, right) =>
          new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
      ),
    [events],
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<Date | null> = [];
    for (let index = 0; index < startingDayOfWeek; index += 1) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) {
      return [];
    }

    return sortedEvents.filter((event) =>
      isSameDay(new Date(event.startAt), date),
    );
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  const getEventColor = (type: CalendarEventType) => {
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

  const getEventBadge = (type: CalendarEventType) => {
    switch (type) {
      case "lecture":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Lecture
          </Badge>
        );
      case "exam":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Exam</Badge>
        );
      case "deadline":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            Deadline
          </Badge>
        );
      case "office-hours":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Office Hours
          </Badge>
        );
      case "holiday":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
            Holiday
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onAddEvent({
        title: eventForm.title,
        type: eventForm.type,
        startAt: combineDateAndTime(eventForm.date, eventForm.startTime),
        endAt: eventForm.endTime
          ? combineDateAndTime(eventForm.date, eventForm.endTime)
          : undefined,
        location: eventForm.location || undefined,
        description: eventForm.description || undefined,
      });
      setEventForm({
        title: "",
        type: "lecture",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        description: "",
      });
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const activeToday = Boolean(date && isToday(date));

                return (
                  <div
                    key={`${date?.toISOString() ?? "empty"}-${index}`}
                    className={`min-h-24 p-2 rounded-lg border transition-all ${
                      !date
                        ? "bg-gray-50 border-transparent"
                        : activeToday
                          ? "bg-indigo-50 border-indigo-500 border-2"
                          : "bg-white border-gray-200 hover:border-gray-300 cursor-pointer"
                    }`}
                  >
                    {date ? (
                      <>
                        <div
                          className={`text-sm font-medium mb-1 ${
                            activeToday ? "text-indigo-700" : "text-gray-900"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((calendarEvent) => (
                            <div
                              key={calendarEvent.id}
                              className={`text-xs px-1.5 py-1 rounded ${getEventColor(
                                calendarEvent.type,
                              )} text-white truncate`}
                            >
                              {calendarEvent.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 ? (
                            <div className="text-xs text-gray-600 px-1.5">
                              +{dayEvents.length - 2} more
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedEvents
                .filter((calendarEvent) => new Date(calendarEvent.startAt) >= today)
                .slice(0, 5)
                .map((calendarEvent) => (
                  <div
                    key={calendarEvent.id}
                    className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className={`size-2 rounded-full ${getEventColor(
                          calendarEvent.type,
                        )} mt-1.5`}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {calendarEvent.title}
                        </h4>
                        {getEventBadge(calendarEvent.type)}
                      </div>
                    </div>
                    <div className="space-y-1 ml-5">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CalendarIcon className="size-3" />
                        <span>{format(new Date(calendarEvent.startAt), "MMM d")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="size-3" />
                        <span>
                          {format(new Date(calendarEvent.startAt), "h:mm a")}
                          {calendarEvent.endAt
                            ? ` - ${format(new Date(calendarEvent.endAt), "h:mm a")}`
                            : ""}
                        </span>
                      </div>
                      {calendarEvent.location ? (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="size-3" />
                          <span>{calendarEvent.location}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              Save a new calendar event to this course.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={eventForm.title}
                onChange={(event) =>
                  setEventForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-type">Type</Label>
                <Input
                  id="event-type"
                  value={eventForm.type}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      type: event.target.value as CalendarEventType,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={eventForm.date}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-start">Start time</Label>
                <Input
                  id="event-start"
                  type="time"
                  value={eventForm.startTime}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      startTime: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-end">End time</Label>
                <Input
                  id="event-end"
                  type="time"
                  value={eventForm.endTime}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={eventForm.location}
                onChange={(event) =>
                  setEventForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Input
                id="event-description"
                value={eventForm.description}
                onChange={(event) =>
                  setEventForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
