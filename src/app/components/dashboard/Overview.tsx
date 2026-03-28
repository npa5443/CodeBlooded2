import { Users, BookOpen, FileText, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  students: number;
}

interface OverviewProps {
  course: Course;
}

export function Overview({ course }: OverviewProps) {
  const stats = [
    { label: "Students Enrolled", value: course.students, icon: Users, color: "text-[#2d4263]", bg: "bg-blue-50", border: "border-[#2d4263]/20" },
    { label: "Modules Completed", value: "8/12", icon: BookOpen, color: "text-[#6b8e7f]", bg: "bg-green-50", border: "border-[#6b8e7f]/20" },
    { label: "Assignments Graded", value: "24/28", icon: FileText, color: "text-[#8b3a3a]", bg: "bg-red-50", border: "border-[#8b3a3a]/20" },
    { label: "Avg. Performance", value: "84%", icon: TrendingUp, color: "text-[#d4a574]", bg: "bg-orange-50", border: "border-[#d4a574]/20" },
  ];

  const recentActivities = [
    { action: "Assignment submitted", detail: "Midterm Project - 23 submissions", time: "2 hours ago" },
    { action: "Quiz completed", detail: "Chapter 5 Quiz - 98 responses", time: "5 hours ago" },
    { action: "Material uploaded", detail: "Lecture 9: Advanced Topics", time: "1 day ago" },
    { action: "Discussion posted", detail: "New thread in Course Forum", time: "2 days ago" },
    { action: "Grades published", detail: "Assignment 4 grades released", time: "3 days ago" },
  ];

  const upcomingTasks = [
    { task: "Grade Midterm Projects", due: "Due March 30", priority: "high" },
    { task: "Prepare Lecture 10 Slides", due: "Due March 29", priority: "medium" },
    { task: "Review Student Questions", due: "Due Today", priority: "high" },
    { task: "Update Course Syllabus", due: "Due April 2", priority: "low" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border-2 ${stat.border} hover:shadow-lg transition-all cursor-pointer group`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`size-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="size-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.detail}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-0.5">
                    <CheckCircle2 className="size-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="size-3 text-gray-500" />
                      <p className="text-sm text-gray-600">{item.due}</p>
                      {item.priority === "high" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">High Priority</span>
                      )}
                      {item.priority === "medium" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">Medium</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle>Course Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Lecture Progress</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">9</span>
                <span className="text-gray-600">of 15 lectures</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Student Engagement</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">92%</span>
                <span className="text-green-600 text-sm">+5% this week</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Assignment Completion</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">86%</span>
                <span className="text-gray-600">average rate</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "86%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}