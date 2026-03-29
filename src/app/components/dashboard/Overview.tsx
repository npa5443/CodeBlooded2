import { format, formatDistanceToNow, isToday } from "date-fns";
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { CourseOverview, CourseSummary } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface OverviewProps {
  course: CourseSummary;
  overview: CourseOverview;
}

function formatDueDate(date: string) {
  const value = new Date(date);
  return isToday(value) ? "Due Today" : `Due ${format(value, "MMMM d")}`;
}

export function Overview({ course, overview }: OverviewProps) {
  const stats = [
    {
      label: "Students Enrolled",
      value: course.students,
      icon: Users,
      color: "text-[#2d4263]",
      bg: "bg-blue-50",
      border: "border-[#2d4263]/20",
    },
    {
      label: "Modules Completed",
      value: `${overview.modulesCompleted.completed}/${overview.modulesCompleted.total}`,
      icon: BookOpen,
      color: "text-[#6b8e7f]",
      bg: "bg-green-50",
      border: "border-[#6b8e7f]/20",
    },
    {
      label: "Assignments Graded",
      value: `${overview.assignmentsGraded.completed}/${overview.assignmentsGraded.total}`,
      icon: FileText,
      color: "text-[#8b3a3a]",
      bg: "bg-red-50",
      border: "border-[#8b3a3a]/20",
    },
    {
      label: "Avg. Performance",
      value: `${overview.avgPerformance}%`,
      icon: TrendingUp,
      color: "text-[#d4a574]",
      bg: "bg-orange-50",
      border: "border-[#d4a574]/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={`border-2 ${stat.border} hover:shadow-lg transition-all cursor-pointer group`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div
                  className={`size-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="size-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.detail}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.happenedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overview.upcomingTasks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-0.5">
                    <CheckCircle2 className="size-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="size-3 text-gray-500" />
                      <p className="text-sm text-gray-600">{formatDueDate(item.dueDate)}</p>
                      {item.priority === "high" ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                          High Priority
                        </span>
                      ) : null}
                      {item.priority === "medium" ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                          Medium
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
