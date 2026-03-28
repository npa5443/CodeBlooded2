import { useState } from "react";
import { GraduationCap, Plus, User, Settings as SettingsIcon, LogOut, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useNavigate } from "react-router";
import { Overview } from "../components/dashboard/Overview";
import { Knowledge } from "../components/dashboard/Knowledge";
import { Insights } from "../components/dashboard/Insights";
import { Planner } from "../components/dashboard/Planner";
import { Slides } from "../components/dashboard/Slides";
import { CalendarSection } from "../components/dashboard/CalendarSection";

interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  students: number;
}

const MOCK_COURSES: Course[] = [
  { id: "1", name: "Introduction to Computer Science", code: "CS 101", color: "bg-blue-500", students: 145 },
  { id: "2", name: "Data Structures & Algorithms", code: "CS 201", color: "bg-purple-500", students: 98 },
  { id: "3", name: "Machine Learning Fundamentals", code: "CS 405", color: "bg-green-500", students: 76 },
  { id: "4", name: "Software Engineering", code: "CS 302", color: "bg-orange-500", students: 112 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<Course>(MOCK_COURSES[0]);
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="h-screen flex bg-[#fdfbf7]">
      {/* Left Sidebar */}
      <aside className="w-80 bg-gradient-to-b from-[#1a1a2e] to-[#2d3250] flex flex-col shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-[#d4a574] to-[#c4956a] flex items-center justify-center shadow-lg">
              <GraduationCap className="size-6 text-[#1a1a2e]" />
            </div>
            <span className="text-xl font-semibold text-white">Faculty Flow</span>
          </div>
        </div>

        {/* Courses List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs font-semibold text-[#d4a574] uppercase tracking-wider mb-3 px-3">
            My Courses
          </div>
          <div className="space-y-1">
            {MOCK_COURSES.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                  selectedCourse.id === course.id
                    ? "bg-[#d4a574] text-[#1a1a2e] shadow-md"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-3 rounded-full ${course.color} mt-1.5 flex-shrink-0 ${selectedCourse.id === course.id ? 'opacity-80' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{course.name}</div>
                    <div className={`text-sm mt-0.5 ${selectedCourse.id === course.id ? 'text-[#1a1a2e]/70' : 'text-gray-400'}`}>
                      {course.code} • {course.students} students
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add Course Button */}
        <div className="p-4 border-t border-white/10">
          <Button className="w-full bg-[#d4a574] hover:bg-[#c4956a] text-[#1a1a2e] shadow-md">
            <Plus className="size-4 mr-2" />
            Add Course
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-[#d4a574]/20 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{selectedCourse.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{selectedCourse.code}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium">
                    DS
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">Dr. Jane Smith</div>
                  <div className="text-xs text-gray-500">Professor</div>
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
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="size-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-white border border-gray-200 p-1">
                <TabsTrigger value="overview" className="px-6">Overview</TabsTrigger>
                <TabsTrigger value="knowledge" className="px-6">Knowledge</TabsTrigger>
                <TabsTrigger value="insights" className="px-6">Insights</TabsTrigger>
                <TabsTrigger value="planner" className="px-6">Planner</TabsTrigger>
                <TabsTrigger value="slides" className="px-6">Slides</TabsTrigger>
                <TabsTrigger value="calendar" className="px-6">Calendar</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Overview course={selectedCourse} />
              </TabsContent>

              <TabsContent value="knowledge">
                <Knowledge course={selectedCourse} />
              </TabsContent>

              <TabsContent value="insights">
                <Insights course={selectedCourse} />
              </TabsContent>

              <TabsContent value="planner">
                <Planner course={selectedCourse} />
              </TabsContent>

              <TabsContent value="slides">
                <Slides course={selectedCourse} />
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarSection course={selectedCourse} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}