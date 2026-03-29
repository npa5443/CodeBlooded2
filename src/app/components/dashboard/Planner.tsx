import { format } from "date-fns";
import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Circle,
  FileText,
  GripVertical,
  Pencil,
  Plus,
} from "lucide-react";
import { downloadFilePayload } from "../../lib/files";
import type {
  CoursePlanner,
  GeneratedPlannerDocumentResult,
  PlannerLesson,
  PlannerModule,
  PlannerTask,
} from "../../lib/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

type ModuleFormState = {
  title: string;
  lessonCount: number;
  duration: string;
  firstLessonTitle: string;
  firstLessonDate: string;
  lessonStartTime: string;
  lessonDurationMinutes: number;
};

type LessonFormState = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  prepared: boolean;
  notes: string;
};

interface PlannerProps {
  planner: CoursePlanner;
  onAddModule: (payload: {
    title: string;
    lessonCount: number;
    duration: string;
    firstLessonTitle?: string;
    firstLessonDate?: string;
    lessonStartTime?: string;
    lessonDurationMinutes?: number;
  }) => Promise<void>;
  onUpdateModule: (
    moduleId: string,
    payload: {
      title: string;
      duration: string;
      status: "completed" | "in-progress" | "upcoming";
      lessonItems: PlannerLesson[];
    },
  ) => Promise<void>;
  onReorderModules: (moduleIds: string[]) => Promise<void>;
  onAddTask: (payload: {
    title: string;
    dueDate: string;
    priority: "high" | "medium" | "low";
  }) => Promise<void>;
  onToggleTask: (task: PlannerTask) => Promise<void>;
  onGenerateTemplate: (payload: {
    templateType: "lecture" | "lab" | "review";
    moduleId?: string;
    lessonIds: string[];
  }) => Promise<GeneratedPlannerDocumentResult>;
}

function buildInitialModuleForm(): ModuleFormState {
  return {
    title: "",
    lessonCount: 4,
    duration: "2 weeks",
    firstLessonTitle: "",
    firstLessonDate: "",
    lessonStartTime: "09:00",
    lessonDurationMinutes: 75,
  };
}

function buildEmptyLessonForm(): LessonFormState {
  return {
    id: crypto.randomUUID(),
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:15",
    prepared: false,
    notes: "",
  };
}

function toLessonForm(lesson: PlannerLesson): LessonFormState {
  return {
    id: lesson.id,
    title: lesson.title,
    date: format(new Date(lesson.startAt), "yyyy-MM-dd"),
    startTime: format(new Date(lesson.startAt), "HH:mm"),
    endTime: lesson.endAt ? format(new Date(lesson.endAt), "HH:mm") : "",
    prepared: lesson.prepared,
    notes: lesson.notes ?? "",
  };
}

function toLessonPayload(lesson: LessonFormState): PlannerLesson {
  const startAt = new Date(`${lesson.date}T${lesson.startTime || "09:00"}:00`).toISOString();
  const endAt = lesson.endTime
    ? new Date(`${lesson.date}T${lesson.endTime}:00`).toISOString()
    : undefined;

  return {
    id: lesson.id,
    title: lesson.title.trim() || "Untitled Lesson",
    startAt,
    endAt,
    prepared: lesson.prepared,
    notes: lesson.notes.trim(),
  };
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function Planner({
  planner,
  onAddModule,
  onUpdateModule,
  onReorderModules,
  onAddTask,
  onToggleTask,
  onGenerateTemplate,
}: PlannerProps) {
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [templateKind, setTemplateKind] = useState<"lecture" | "lab" | "review" | null>(null);
  const [moduleSubmitting, setModuleSubmitting] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [moduleActionId, setModuleActionId] = useState<string | null>(null);
  const [draggingModuleId, setDraggingModuleId] = useState<string | null>(null);
  const [dragTargetModuleId, setDragTargetModuleId] = useState<string | null>(null);
  const [templateSubmitting, setTemplateSubmitting] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] =
    useState<GeneratedPlannerDocumentResult | null>(null);
  const [moduleForm, setModuleForm] = useState<ModuleFormState>(buildInitialModuleForm());
  const [taskForm, setTaskForm] = useState({
    title: "",
    dueDate: "",
    priority: "medium" as const,
  });
  const [editModuleForm, setEditModuleForm] = useState<{
    title: string;
    duration: string;
    status: "completed" | "in-progress" | "upcoming";
    lessonItems: LessonFormState[];
  }>({
    title: "",
    duration: "2 weeks",
    status: "upcoming",
    lessonItems: [],
  });
  const [templateForm, setTemplateForm] = useState({
    moduleId: planner.modules[0]?.id ?? "",
    lessonIds: planner.modules[0]?.lessonItems.map((lesson) => lesson.id) ?? [],
    outputFormat: "pdf" as "pdf" | "word",
  });

  const editingModule =
    planner.modules.find((module) => module.id === editingModuleId) ?? null;
  const selectedTemplateModule =
    planner.modules.find((module) => module.id === templateForm.moduleId) ?? null;
  const openEditDialog = (module: PlannerModule) => {
    setEditingModuleId(module.id);
    setEditModuleForm({
      title: module.title,
      duration: module.duration,
      status: module.status,
      lessonItems:
        module.lessonItems.length > 0
          ? module.lessonItems.map(toLessonForm)
          : [buildEmptyLessonForm()],
    });
  };

  const openTemplateDialog = (kind: "lecture" | "lab" | "review") => {
    const firstModule = planner.modules[0] ?? null;
    setTemplateKind(kind);
    setGeneratedTemplate(null);
    setTemplateForm({
      moduleId: firstModule?.id ?? "",
      lessonIds: firstModule?.lessonItems.map((lesson) => lesson.id) ?? [],
      outputFormat: "pdf",
    });
  };

  const handleModuleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setModuleSubmitting(true);

    try {
      await onAddModule({
        title: moduleForm.title,
        lessonCount: moduleForm.lessonCount,
        duration: moduleForm.duration,
        firstLessonTitle: moduleForm.firstLessonTitle || undefined,
        firstLessonDate: moduleForm.firstLessonDate || undefined,
        lessonStartTime: moduleForm.lessonStartTime || undefined,
        lessonDurationMinutes: moduleForm.lessonDurationMinutes,
      });
      setModuleForm(buildInitialModuleForm());
      setIsModuleDialogOpen(false);
    } finally {
      setModuleSubmitting(false);
    }
  };

  const handleTaskSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTaskSubmitting(true);

    try {
      await onAddTask(taskForm);
      setTaskForm({ title: "", dueDate: "", priority: "medium" });
      setIsTaskDialogOpen(false);
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleModuleStatusToggle = async (module: PlannerModule) => {
    setModuleActionId(module.id);

    try {
      await onUpdateModule(module.id, {
        title: module.title,
        duration: module.duration,
        status: module.status === "completed" ? "in-progress" : "completed",
        lessonItems: module.lessonItems,
      });
    } finally {
      setModuleActionId(null);
    }
  };

  const handleModuleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingModuleId) {
      return;
    }

    setModuleActionId(editingModuleId);

    try {
      await onUpdateModule(editingModuleId, {
        title: editModuleForm.title,
        duration: editModuleForm.duration,
        status: editModuleForm.status,
        lessonItems: editModuleForm.lessonItems.map(toLessonPayload),
      });
      setEditingModuleId(null);
    } finally {
      setModuleActionId(null);
    }
  };

  const handleModuleDrop = async (targetModuleId: string) => {
    if (!draggingModuleId || draggingModuleId === targetModuleId) {
      setDraggingModuleId(null);
      setDragTargetModuleId(null);
      return;
    }

    const fromIndex = planner.modules.findIndex((module) => module.id === draggingModuleId);
    const toIndex = planner.modules.findIndex((module) => module.id === targetModuleId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggingModuleId(null);
      setDragTargetModuleId(null);
      return;
    }

    setModuleActionId(draggingModuleId);

    try {
      await onReorderModules(moveItem(planner.modules, fromIndex, toIndex).map((module) => module.id));
    } finally {
      setModuleActionId(null);
      setDraggingModuleId(null);
      setDragTargetModuleId(null);
    }
  };

  const handleTemplateGenerate = async () => {
    if (!templateKind || !templateForm.moduleId) {
      return;
    }

    setTemplateSubmitting(true);

    try {
      const result = await onGenerateTemplate({
        templateType: templateKind,
        moduleId: templateForm.moduleId,
        lessonIds: templateForm.lessonIds,
      });
      setGeneratedTemplate(result);
    } finally {
      setTemplateSubmitting(false);
    }
  };

  const updateLesson = (
    lessonId: string,
    updater: (lesson: LessonFormState) => LessonFormState,
  ) => {
    setEditModuleForm((current) => ({
      ...current,
      lessonItems: current.lessonItems.map((lesson) =>
        lesson.id === lessonId ? updater(lesson) : lesson,
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Course Structure</CardTitle>
          <Button variant="outline" onClick={() => setIsModuleDialogOpen(true)} type="button">
            <Plus className="size-4 mr-2" />
            Add Module
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {planner.modules.map((module, index) => (
              <div
                key={module.id}
                draggable
                onDragStart={() => setDraggingModuleId(module.id)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragTargetModuleId(module.id);
                }}
                onDragLeave={() => {
                  if (dragTargetModuleId === module.id) {
                    setDragTargetModuleId(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  void handleModuleDrop(module.id);
                }}
                onDragEnd={() => {
                  setDraggingModuleId(null);
                  setDragTargetModuleId(null);
                }}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  dragTargetModuleId === module.id
                    ? "border-[#d4a574] bg-[#fdfbf7]"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <GripVertical className="size-5 text-gray-400 flex-shrink-0 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Module {index + 1}: {module.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>{module.lessonItems.length} lessons</span>
                        <span>•</span>
                        <span>{module.duration}</span>
                        {module.lessonItems[0] ? (
                          <>
                            <span>•</span>
                            <span>
                              First lesson {format(new Date(module.lessonItems[0].startAt), "MMM d")}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {module.status === "completed" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Completed
                        </Badge>
                      ) : null}
                      {module.status === "in-progress" ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          In Progress
                        </Badge>
                      ) : null}
                      {module.status === "upcoming" ? (
                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          Upcoming
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(module)}
                      type="button"
                    >
                      <Pencil className="size-3 mr-1" />
                      Edit Module
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={moduleActionId === module.id}
                      onClick={() => void handleModuleStatusToggle(module)}
                      type="button"
                    >
                      {module.status === "completed" ? "Reopen" : "Mark Complete"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {planner.modules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                No modules yet. Add your first module to start structuring the course.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Planning Tasks</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTaskDialogOpen(true)}
              type="button"
            >
              <Plus className="size-4 mr-2" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {planner.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    task.completed
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-200 hover:bg-gray-50"
                  } transition-colors`}
                >
                  <button className="mt-0.5" onClick={() => onToggleTask(task)} type="button">
                    {task.completed ? (
                      <CheckCircle2 className="size-5 text-green-600" />
                    ) : (
                      <Circle className="size-5 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${
                        task.completed ? "text-gray-500 line-through" : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="size-3 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(task.dueDate), "MMMM d, yyyy")}
                      </span>
                      {!task.completed ? (
                        <>
                          {task.priority === "high" ? (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                              High
                            </Badge>
                          ) : null}
                          {task.priority === "medium" ? (
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs">
                              Medium
                            </Badge>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {planner.tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                  No planning tasks yet.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {planner.upcomingLessons.map((lesson) => (
                <div
                  key={lesson.id}
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
                    <span>{format(new Date(lesson.startAt), "MMMM d, yyyy")}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(lesson.startAt), "h:mm a")}
                      {lesson.endAt ? ` - ${format(new Date(lesson.endAt), "h:mm a")}` : ""}
                    </span>
                  </div>
                </div>
              ))}
              {planner.upcomingLessons.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                  Upcoming lessons will appear here once you add dated lessons to a module.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Lesson Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {planner.lessonTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                disabled={planner.modules.length === 0}
                className="p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center disabled:opacity-60 disabled:hover:border-gray-300 disabled:hover:bg-transparent"
                onClick={() => openTemplateDialog(template.kind)}
              >
                <FileText className="size-8 text-gray-400 mx-auto mb-3" />
                <p className="font-medium text-gray-900 mb-1">{template.title}</p>
                <p className="text-sm text-gray-600">{template.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Module</DialogTitle>
            <DialogDescription>
              Create a new module and optionally seed its first lesson schedule.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleModuleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="module-title">Module title</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(event) =>
                  setModuleForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module-lessons">Lessons</Label>
                <Input
                  id="module-lessons"
                  type="number"
                  min="1"
                  value={moduleForm.lessonCount}
                  onChange={(event) =>
                    setModuleForm((current) => ({
                      ...current,
                      lessonCount: Number(event.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-duration">Duration</Label>
                <Input
                  id="module-duration"
                  value={moduleForm.duration}
                  onChange={(event) =>
                    setModuleForm((current) => ({
                      ...current,
                      duration: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-lesson-title">First lesson title</Label>
                <Input
                  id="first-lesson-title"
                  value={moduleForm.firstLessonTitle}
                  onChange={(event) =>
                    setModuleForm((current) => ({
                      ...current,
                      firstLessonTitle: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-lesson-date">First lesson date</Label>
                <Input
                  id="first-lesson-date"
                  type="date"
                  value={moduleForm.firstLessonDate}
                  onChange={(event) =>
                    setModuleForm((current) => ({
                      ...current,
                      firstLessonDate: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-start-time">Lesson start time</Label>
                <Input
                  id="lesson-start-time"
                  type="time"
                  value={moduleForm.lessonStartTime}
                  onChange={(event) =>
                    setModuleForm((current) => ({
                      ...current,
                      lessonStartTime: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-duration-minutes">Lesson length (minutes)</Label>
                <Input
                  id="lesson-duration-minutes"
                  type="number"
                  min="30"
                  value={moduleForm.lessonDurationMinutes}
                  onChange={(event) =>
                    setModuleForm((current) => ({
                      ...current,
                      lessonDurationMinutes: Number(event.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={moduleSubmitting}>
                {moduleSubmitting ? "Saving..." : "Add Module"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingModule)} onOpenChange={(open) => !open && setEditingModuleId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editingModule ? (
            <>
              <DialogHeader>
                <DialogTitle>Edit Module</DialogTitle>
                <DialogDescription>
                  Update module details, create lessons, and control upcoming lesson visibility.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-6" onSubmit={handleModuleSave}>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="edit-module-title">Module title</Label>
                    <Input
                      id="edit-module-title"
                      value={editModuleForm.title}
                      onChange={(event) =>
                        setEditModuleForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-module-status">Status</Label>
                    <Select
                      value={editModuleForm.status}
                      onValueChange={(value) =>
                        setEditModuleForm((current) => ({
                          ...current,
                          status: value as "completed" | "in-progress" | "upcoming",
                        }))
                      }
                    >
                      <SelectTrigger id="edit-module-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-module-duration">Duration</Label>
                  <Input
                    id="edit-module-duration"
                    value={editModuleForm.duration}
                    onChange={(event) =>
                      setEditModuleForm((current) => ({
                        ...current,
                        duration: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Lessons</h3>
                      <p className="text-sm text-gray-500">
                        Upcoming lessons are derived from the dated lesson entries below.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setEditModuleForm((current) => ({
                          ...current,
                          lessonItems: [...current.lessonItems, buildEmptyLessonForm()],
                        }))
                      }
                    >
                      <Plus className="size-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {editModuleForm.lessonItems.map((lesson, index) => (
                      <div key={lesson.id} className="rounded-xl border border-gray-200 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Lesson {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              setEditModuleForm((current) => ({
                                ...current,
                                lessonItems: current.lessonItems.filter((item) => item.id !== lesson.id),
                              }))
                            }
                            disabled={editModuleForm.lessonItems.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`lesson-title-${lesson.id}`}>Lesson title</Label>
                          <Input
                            id={`lesson-title-${lesson.id}`}
                            value={lesson.title}
                            onChange={(event) =>
                              updateLesson(lesson.id, (current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`lesson-date-${lesson.id}`}>Date</Label>
                            <Input
                              id={`lesson-date-${lesson.id}`}
                              type="date"
                              value={lesson.date}
                              onChange={(event) =>
                                updateLesson(lesson.id, (current) => ({
                                  ...current,
                                  date: event.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`lesson-start-${lesson.id}`}>Start time</Label>
                            <Input
                              id={`lesson-start-${lesson.id}`}
                              type="time"
                              value={lesson.startTime}
                              onChange={(event) =>
                                updateLesson(lesson.id, (current) => ({
                                  ...current,
                                  startTime: event.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`lesson-end-${lesson.id}`}>End time</Label>
                            <Input
                              id={`lesson-end-${lesson.id}`}
                              type="time"
                              value={lesson.endTime}
                              onChange={(event) =>
                                updateLesson(lesson.id, (current) => ({
                                  ...current,
                                  endTime: event.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`lesson-prepared-${lesson.id}`}
                            checked={lesson.prepared}
                            onCheckedChange={(checked) =>
                              updateLesson(lesson.id, (current) => ({
                                ...current,
                                prepared: Boolean(checked),
                              }))
                            }
                          />
                          <Label htmlFor={`lesson-prepared-${lesson.id}`}>Lesson is prepared</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`lesson-notes-${lesson.id}`}>Notes</Label>
                          <Textarea
                            id={`lesson-notes-${lesson.id}`}
                            rows={3}
                            value={lesson.notes}
                            onChange={(event) =>
                              updateLesson(lesson.id, (current) => ({
                                ...current,
                                notes: event.target.value,
                              }))
                            }
                            placeholder="Objectives, prep notes, or reminders..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingModuleId(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={moduleActionId === editingModule.id}>
                    {moduleActionId === editingModule.id ? "Saving..." : "Save Module"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(templateKind)} onOpenChange={(open) => !open && setTemplateKind(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {templateKind ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {templateKind === "lecture"
                    ? "Generate Lecture Note-Taking Guide"
                    : templateKind === "lab"
                      ? "Generate Lab Activity"
                      : "Generate Review Document"}
                </DialogTitle>
                <DialogDescription>
                  Select the module lessons to use, then generate downloadable PDF or Word-ready files.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="template-module">Module</Label>
                  <Select
                    value={templateForm.moduleId}
                    onValueChange={(value) => {
                      const nextModule = planner.modules.find((module) => module.id === value);
                      setTemplateForm((current) => ({
                        ...current,
                        moduleId: value,
                        lessonIds: nextModule?.lessonItems.map((lesson) => lesson.id) ?? [],
                      }));
                    }}
                  >
                    <SelectTrigger id="template-module">
                      <SelectValue placeholder="Choose a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {planner.modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Lessons</h3>
                      <p className="text-sm text-gray-500">Choose which lessons the template should pull from.</p>
                    </div>
                    <Select
                      value={templateForm.outputFormat}
                      onValueChange={(value) =>
                        setTemplateForm((current) => ({
                          ...current,
                          outputFormat: value as "pdf" | "word",
                        }))
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF download</SelectItem>
                        <SelectItem value="word">Word (.rtf)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    {(selectedTemplateModule?.lessonItems ?? []).map((lesson) => (
                      <label
                        key={lesson.id}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={templateForm.lessonIds.includes(lesson.id)}
                          onCheckedChange={(checked) =>
                            setTemplateForm((current) => ({
                              ...current,
                              lessonIds: Boolean(checked)
                                ? [...current.lessonIds, lesson.id]
                                : current.lessonIds.filter((lessonId) => lessonId !== lesson.id),
                            }))
                          }
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{lesson.title}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(lesson.startAt), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </label>
                    ))}
                    {!selectedTemplateModule || selectedTemplateModule.lessonItems.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                        Add lessons to the selected module before generating a template.
                      </div>
                    ) : null}
                  </div>
                </div>

                {generatedTemplate ? (
                  <div className="rounded-xl border border-[#d4a574]/30 bg-[#fdfbf7] p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {generatedTemplate.document.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {generatedTemplate.document.summary}
                      </p>
                    </div>
                    <div className="space-y-4">
                      {generatedTemplate.document.sections.map((section) => (
                        <div key={section.heading}>
                          <h4 className="font-medium text-gray-900 mb-2">{section.heading}</h4>
                          {section.paragraphs.map((paragraph) => (
                            <p key={paragraph} className="text-sm text-gray-700 mb-2">
                              {paragraph}
                            </p>
                          ))}
                          {section.bullets.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                              {section.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <DialogFooter className="sm:justify-between">
                  <div />
                  <div className="flex gap-2">
                    {generatedTemplate ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          downloadFilePayload(
                            templateForm.outputFormat === "pdf"
                              ? generatedTemplate.files.pdf
                              : generatedTemplate.files.word,
                          )
                        }
                      >
                        {templateForm.outputFormat === "pdf"
                          ? "Download PDF"
                          : "Download Word"}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      disabled={
                        templateSubmitting ||
                        !templateForm.moduleId ||
                        templateForm.lessonIds.length === 0
                      }
                      onClick={() => void handleTemplateGenerate()}
                    >
                      {templateSubmitting ? "Generating..." : "Generate Template"}
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Planning Task</DialogTitle>
            <DialogDescription>
              Save a new task and keep it synced with the planner backend.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleTaskSubmit}>
            <div className="space-y-2">
              <Label htmlFor="task-title">Task title</Label>
              <Input
                id="task-title"
                value={taskForm.title}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-due-date">Due date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(value) =>
                    setTaskForm((current) => ({
                      ...current,
                      priority: value as "high" | "medium" | "low",
                    }))
                  }
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={taskSubmitting}>
                {taskSubmitting ? "Saving..." : "Add Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
