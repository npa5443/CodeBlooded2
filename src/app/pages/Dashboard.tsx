import { useEffect, useState } from "react";
import {
  ChevronDown,
  LogOut,
  Plus,
  Settings as SettingsIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CalendarSection } from "../components/dashboard/CalendarSection";
import { Insights } from "../components/dashboard/Insights";
import { Knowledge } from "../components/dashboard/Knowledge";
import { Overview } from "../components/dashboard/Overview";
import { Planner } from "../components/dashboard/Planner";
import { Slides } from "../components/dashboard/Slides";
import { PageLoader } from "../components/common/PageLoader";
import { BrandLogo } from "../components/common/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type {
  CalendarEventType,
  Course,
  CourseSummary,
  PlannerTask,
  SlideSuggestionStatus,
} from "../lib/types";

const courseColorOptions = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-rose-500", label: "Rose" },
];

function CourseColorPicker({
  selectedColor,
  onSelect,
}: {
  selectedColor: string;
  onSelect: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {courseColorOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`rounded-lg border p-3 text-xs font-medium ${
            selectedColor === option.value
              ? "border-[#1a1a2e] bg-[#f4f1ea]"
              : "border-gray-200"
          }`}
          onClick={() => onSelect(option.value)}
        >
          <div className={`size-4 rounded-full ${option.value} mx-auto mb-2`} />
          {option.label}
        </button>
      ))}
    </div>
  );
}

function toCourseSummary(course: Course): CourseSummary {
  return {
    id: course.id,
    name: course.name,
    code: course.code,
    color: course.color,
    students: course.students,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function Dashboard() {
  const navigate = useNavigate();
  const { logout, token, user } = useAuth();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingCourseDetail, setIsLoadingCourseDetail] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    students: "35",
    color: "bg-blue-500",
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    setIsLoadingCourses(true);

    api
      .getCourses(token)
      .then(({ courses: courseList }) => {
        if (cancelled) {
          return;
        }

        setCourses(courseList);
        setSelectedCourseId((current) => {
          if (current && courseList.some((course) => course.id === current)) {
            return current;
          }

          return courseList[0]?.id ?? null;
        });
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCourses(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !selectedCourseId) {
      setSelectedCourse(null);
      return;
    }

    let cancelled = false;
    setIsLoadingCourseDetail(true);

    api
      .getCourse(token, selectedCourseId)
      .then(({ course }) => {
        if (!cancelled) {
          setSelectedCourse(course);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCourseDetail(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCourseId, token]);

  const applyCourseUpdate = (course: Course) => {
    const summary = toCourseSummary(course);
    setSelectedCourse(course);
    setCourses((current) => {
      const index = current.findIndex((item) => item.id === summary.id);
      if (index === -1) {
        return [summary, ...current];
      }

      const next = [...current];
      next[index] = summary;
      return next;
    });
  };

  const runCourseMutation = async (
    request: () => Promise<{ course: Course }>,
    successMessage: string,
  ) => {
    try {
      const response = await request();
      applyCourseUpdate(response.course);
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const runAction = async <T,>(
    request: () => Promise<T>,
    successMessage: string,
  ) => {
    try {
      const response = await request();
      toast.success(successMessage);
      return response;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleCreateCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsCreatingCourse(true);

    try {
      const response = await api.createCourse(token, {
        name: courseForm.name,
        code: courseForm.code,
        color: courseForm.color,
        students: Number(courseForm.students),
      });
      applyCourseUpdate(response.course);
      setSelectedCourseId(response.course.id);
      setCourseForm({
        name: "",
        code: "",
        students: "35",
        color: "bg-blue-500",
      });
      setIsAddCourseOpen(false);
      toast.success("Course created.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsCreatingCourse(false);
    }
  };

  if (isLoadingCourses || (selectedCourseId && isLoadingCourseDetail && !selectedCourse)) {
    return <PageLoader message="Loading your courses..." />;
  }

  if (!selectedCourse && courses.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            No courses yet
          </h1>
          <p className="text-gray-600 mb-6">
            Create your first course and the full backend-connected dashboard will be ready
            to use.
          </p>
          <Button onClick={() => setIsAddCourseOpen(true)}>
            <Plus className="size-4 mr-2" />
            Add Course
          </Button>
        </div>
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Course</DialogTitle>
              <DialogDescription>
                Add a new course and persist it to the backend.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateCourse}>
              <div className="space-y-2">
                <Label htmlFor="empty-course-name">Course name</Label>
                <Input
                  id="empty-course-name"
                  value={courseForm.name}
                  onChange={(event) =>
                    setCourseForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empty-course-code">Course code</Label>
                  <Input
                    id="empty-course-code"
                    value={courseForm.code}
                    onChange={(event) =>
                      setCourseForm((current) => ({
                        ...current,
                        code: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empty-course-students">Students</Label>
                  <Input
                    id="empty-course-students"
                    type="number"
                    min="1"
                    value={courseForm.students}
                    onChange={(event) =>
                      setCourseForm((current) => ({
                        ...current,
                        students: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <CourseColorPicker
                  selectedColor={courseForm.color}
                  onSelect={(color) =>
                    setCourseForm((current) => ({
                      ...current,
                      color,
                    }))
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddCourseOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingCourse}>
                  {isCreatingCourse ? "Creating..." : "Create Course"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (!selectedCourse) {
    return <PageLoader message="Loading course details..." />;
  }

  return (
    <>
      <div className="h-screen flex bg-[#fdfbf7]">
        <aside className="w-80 bg-gradient-to-b from-[#1a1a2e] to-[#2d3250] flex flex-col shadow-xl">
          <div className="p-6 border-b border-white/10">
            <BrandLogo textClassName="text-white text-xl" />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-xs font-semibold text-[#d4a574] uppercase tracking-wider mb-3 px-3">
              My Courses
            </div>
            <div className="space-y-1">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                    selectedCourseId === course.id
                      ? "bg-[#d4a574] text-[#1a1a2e] shadow-md"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`size-3 rounded-full ${course.color} mt-1.5 flex-shrink-0 ${
                        selectedCourseId === course.id ? "opacity-80" : ""
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{course.name}</div>
                      <div
                        className={`text-sm mt-0.5 ${
                          selectedCourseId === course.id
                            ? "text-[#1a1a2e]/70"
                            : "text-gray-400"
                        }`}
                      >
                        {course.code} • {course.students} students
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-white/10">
            <Button
              className="w-full bg-[#d4a574] hover:bg-[#c4956a] text-[#1a1a2e] shadow-md"
              onClick={() => setIsAddCourseOpen(true)}
            >
              <Plus className="size-4 mr-2" />
              Add Course
            </Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 backdrop-blur-md border-b border-[#d4a574]/20 px-8 py-4 flex items-center justify-between shadow-sm">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {selectedCourse.name}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{selectedCourse.code}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                  <Avatar className="size-9">
                    {user?.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    ) : null}
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium">
                      {user?.avatarInitials ?? "FF"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.fullName ?? "Sylla"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.title ?? "Professor"}
                    </div>
                  </div>
                  <ChevronDown className="size-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <SettingsIcon className="size-4 mr-2" />
                  Settings & Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void handleLogout()}>
                  <LogOut className="size-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white border border-gray-200 p-1">
                  <TabsTrigger value="overview" className="px-6">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="px-6">
                    Knowledge
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="px-6">
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="planner" className="px-6">
                    Planner
                  </TabsTrigger>
                  <TabsTrigger value="slides" className="px-6">
                    Slides
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="px-6">
                    Calendar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Overview course={selectedCourse} overview={selectedCourse.overview} />
                </TabsContent>

                <TabsContent value="knowledge">
                  <Knowledge
                    knowledge={selectedCourse.knowledge}
                    onAddMaterial={(payload) =>
                      runCourseMutation(
                        () => api.addMaterial(token!, selectedCourse.id, payload),
                        "Material uploaded.",
                      )
                    }
                    onUpdateMaterialStatus={(materialId, status) =>
                      runCourseMutation(
                        () =>
                          api.updateMaterialStatus(
                            token!,
                            selectedCourse.id,
                            materialId,
                            status,
                          ),
                        "Material updated.",
                      )
                    }
                    onImportGradeData={(payload) =>
                      runCourseMutation(
                        () => api.importGradeData(token!, selectedCourse.id, payload),
                        "Grade data imported.",
                      )
                    }
                  />
                </TabsContent>

                <TabsContent value="insights">
                  <Insights insights={selectedCourse.insights} />
                </TabsContent>

                <TabsContent value="planner">
                  <Planner
                    planner={selectedCourse.planner}
                    onAddModule={(payload) =>
                      runCourseMutation(
                        () => api.addPlannerModule(token!, selectedCourse.id, payload),
                        "Module added.",
                      )
                    }
                    onUpdateModule={(moduleId, payload) =>
                      runCourseMutation(
                        () =>
                          api.updatePlannerModule(
                            token!,
                            selectedCourse.id,
                            moduleId,
                            payload,
                          ),
                        "Module updated.",
                      )
                    }
                    onReorderModules={(moduleIds) =>
                      runCourseMutation(
                        () =>
                          api.reorderPlannerModules(
                            token!,
                            selectedCourse.id,
                            moduleIds,
                          ),
                        "Modules reordered.",
                      )
                    }
                    onAddTask={(payload) =>
                      runCourseMutation(
                        () => api.addPlannerTask(token!, selectedCourse.id, payload),
                        "Task added.",
                      )
                    }
                    onToggleTask={(task: PlannerTask) =>
                      runCourseMutation(
                        () =>
                          api.updatePlannerTask(token!, selectedCourse.id, task.id, {
                            completed: !task.completed,
                          }),
                        task.completed ? "Task reopened." : "Task completed.",
                      )
                    }
                    onGenerateTemplate={(payload) =>
                      runAction(
                        () =>
                          api.generatePlannerDocument(
                            token!,
                            selectedCourse.id,
                            payload,
                          ),
                        "Teaching document generated.",
                      )
                    }
                  />
                </TabsContent>

                <TabsContent value="slides">
                  <Slides
                    slides={selectedCourse.slides}
                    onCreateDeck={(payload) =>
                      runCourseMutation(
                        () => api.createSlideDeck(token!, selectedCourse.id, payload),
                        "Slide deck saved.",
                      )
                    }
                    onGenerateSuggestions={(presentationId) =>
                      runCourseMutation(
                        () =>
                          api.generateSlideSuggestions(
                            token!,
                            selectedCourse.id,
                            presentationId,
                          ),
                        "Suggestions generated.",
                      )
                    }
                    onSuggestionAction={(suggestionId, status: SlideSuggestionStatus) =>
                      runCourseMutation(
                        () =>
                          api.updateSlideSuggestion(
                            token!,
                            selectedCourse.id,
                            suggestionId,
                            status,
                          ),
                        status === "applied"
                          ? "Suggestion applied."
                          : "Suggestion dismissed.",
                      )
                    }
                    onExportPresentation={(presentationId, format) =>
                      runAction(
                        async () =>
                          (
                            await api.exportSlidePresentation(
                              token!,
                              selectedCourse.id,
                              presentationId,
                              format,
                            )
                          ).file,
                        format === "pdf"
                          ? "PDF slideshow downloaded."
                          : "PowerPoint slideshow downloaded.",
                      )
                    }
                  />
                </TabsContent>

                <TabsContent value="calendar">
                  <CalendarSection
                    events={selectedCourse.calendar.events}
                    onAddEvent={(payload: {
                      title: string;
                      type: CalendarEventType;
                      startAt: string;
                      endAt?: string;
                      location?: string;
                      description?: string;
                    }) =>
                      runCourseMutation(
                        () => api.addCalendarEvent(token!, selectedCourse.id, payload),
                        "Event added.",
                      )
                    }
                  />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
            <DialogDescription>
              Add a new course and persist it to the backend.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateCourse}>
            <div className="space-y-2">
              <Label htmlFor="course-name">Course name</Label>
              <Input
                id="course-name"
                value={courseForm.name}
                onChange={(event) =>
                  setCourseForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-code">Course code</Label>
                <Input
                  id="course-code"
                  value={courseForm.code}
                  onChange={(event) =>
                    setCourseForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-students">Students</Label>
                <Input
                  id="course-students"
                  type="number"
                  min="1"
                  value={courseForm.students}
                  onChange={(event) =>
                    setCourseForm((current) => ({
                      ...current,
                      students: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-color">Color</Label>
              <CourseColorPicker
                selectedColor={courseForm.color}
                onSelect={(color) =>
                  setCourseForm((current) => ({
                    ...current,
                    color,
                  }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddCourseOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingCourse}>
                {isCreatingCourse ? "Creating..." : "Create Course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
