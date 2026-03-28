import { GripVertical, Plus, CheckCircle2, Circle, Calendar, FileText } from "lucide-react";
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

interface PlannerProps {
  course: Course;
}

export function Planner({ course }: PlannerProps) {
  const modules = [
    {
      id: 1,
      title: "Introduction & Fundamentals",
      status: "completed",
      lessons: 4,
      duration: "2 weeks",
    },
    {
      id: 2,
      title: "Data Structures Basics",
      status: "completed",
      lessons: 6,
      duration: "3 weeks",
    },
    {
      id: 3,
      title: "Algorithms & Complexity",
      status: "in-progress",
      lessons: 5,
      duration: "2 weeks",
    },
    {
      id: 4,
      title: "Advanced Data Structures",
      status: "upcoming",
      lessons: 7,
      duration: "3 weeks",
    },
    {
      id: 5,
      title: "Design Patterns",
      status: "upcoming",
      lessons: 4,
      duration: "2 weeks",
    },
  ];

  const tasks = [
    {
      title: "Create Midterm Exam",
      dueDate: "March 30, 2026",
      priority: "high",
      completed: false,
    },
    {
      title: "Update Lecture 10 Materials",
      dueDate: "March 29, 2026",
      priority: "high",
      completed: false,
    },
    {
      title: "Review Assignment Rubrics",
      dueDate: "April 2, 2026",
      priority: "medium",
      completed: false,
    },
    {
      title: "Plan Guest Lecture",
      dueDate: "April 5, 2026",
      priority: "medium",
      completed: false,
    },
    {
      title: "Prepare Lab Session 8",
      dueDate: "March 28, 2026",
      priority: "low",
      completed: true,
    },
  ];

  const upcomingLessons = [
    {
      title: "Lecture 10: Binary Search Trees",
      date: "March 29, 2026",
      time: "10:00 AM - 11:30 AM",
      prepared: true,
    },
    {
      title: "Lab Session 9: Tree Traversal",
      date: "March 30, 2026",
      time: "2:00 PM - 3:30 PM",
      prepared: true,
    },
    {
      title: "Lecture 11: AVL Trees",
      date: "April 1, 2026",
      time: "10:00 AM - 11:30 AM",
      prepared: false,
    },
    {
      title: "Office Hours",
      date: "April 2, 2026",
      time: "3:00 PM - 5:00 PM",
      prepared: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Course Structure */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Course Structure</CardTitle>
          <Button variant="outline">
            <Plus className="size-4 mr-2" />
            Add Module
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-move"
              >
                <GripVertical className="size-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Module {module.id}: {module.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{module.lessons} lessons</span>
                        <span>•</span>
                        <span>{module.duration}</span>
                      </div>
                    </div>
                    <div>
                      {module.status === "completed" && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Completed
                        </Badge>
                      )}
                      {module.status === "in-progress" && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          In Progress
                        </Badge>
                      )}
                      {module.status === "upcoming" && (
                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Task List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Planning Tasks</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="size-4 mr-2" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    task.completed
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-200 hover:bg-gray-50"
                  } transition-colors`}
                >
                  <button className="mt-0.5">
                    {task.completed ? (
                      <CheckCircle2 className="size-5 text-green-600" />
                    ) : (
                      <Circle className="size-5 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${
                        task.completed
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="size-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{task.dueDate}</span>
                      {!task.completed && (
                        <>
                          {task.priority === "high" && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                              High
                            </Badge>
                          )}
                          {task.priority === "medium" && (
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs">
                              Medium
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Lessons */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingLessons.map((lesson, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                    {lesson.prepared ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle2 className="size-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                        Prep Needed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="size-3" />
                    <span>{lesson.date}</span>
                    <span>•</span>
                    <span>{lesson.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Template */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Lesson Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
              <FileText className="size-8 text-gray-400 mx-auto mb-3" />
              <p className="font-medium text-gray-900 mb-1">Lecture Template</p>
              <p className="text-sm text-gray-600">Standard lecture format</p>
            </button>
            <button className="p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
              <FileText className="size-8 text-gray-400 mx-auto mb-3" />
              <p className="font-medium text-gray-900 mb-1">Lab Session</p>
              <p className="text-sm text-gray-600">Hands-on practice</p>
            </button>
            <button className="p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
              <FileText className="size-8 text-gray-400 mx-auto mb-3" />
              <p className="font-medium text-gray-900 mb-1">Review Session</p>
              <p className="text-sm text-gray-600">Exam preparation</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
