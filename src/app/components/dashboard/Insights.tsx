import { TrendingDown, AlertTriangle, BarChart3, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  students: number;
}

interface InsightsProps {
  course: Course;
}

export function Insights({ course }: InsightsProps) {
  const weakPoints = [
    {
      topic: "Recursion Concepts",
      studentsStruggling: 42,
      percentage: 29,
      trend: "increasing",
    },
    {
      topic: "Big O Notation",
      studentsStruggling: 38,
      percentage: 26,
      trend: "stable",
    },
    {
      topic: "Binary Trees",
      studentsStruggling: 31,
      percentage: 21,
      trend: "decreasing",
    },
    {
      topic: "Hash Tables",
      studentsStruggling: 24,
      percentage: 17,
      trend: "stable",
    },
  ];

  const quizTrends = [
    { quiz: "Quiz 1", average: 78, submissions: 142 },
    { quiz: "Quiz 2", average: 82, submissions: 139 },
    { quiz: "Quiz 3", average: 75, submissions: 145 },
    { quiz: "Quiz 4", average: 84, submissions: 141 },
    { quiz: "Quiz 5", average: 88, submissions: 138 },
    { quiz: "Quiz 6", average: 86, submissions: 143 },
  ];

  const understandingData = [
    { level: "Excellent", value: 35, color: "#6b8e7f" },
    { level: "Good", value: 42, color: "#2d4263" },
    { level: "Fair", value: 18, color: "#d4a574" },
    { level: "Poor", value: 5, color: "#8b3a3a" },
  ];

  return (
    <div className="space-y-6">
      {/* Student Weak Points */}
      <Card className="border-2 border-[#8b3a3a]/20 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-[#8b3a3a]" />
            Student Weak Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weakPoints.map((point, index) => (
              <div key={index} className="space-y-2 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{point.topic}</h4>
                    {point.trend === "increasing" && (
                      <TrendingDown className="size-4 text-red-500 rotate-180" />
                    )}
                    {point.trend === "decreasing" && (
                      <TrendingDown className="size-4 text-green-500" />
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {point.studentsStruggling} students ({point.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#8b3a3a] to-[#c14953] h-3 rounded-full transition-all"
                    style={{ width: `${point.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quiz Trends */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-[#2d4263]" />
              Quiz Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quizTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="quiz" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="average" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2d4263" />
                    <stop offset="100%" stopColor="#1a1a2e" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Average scores across recent quizzes
            </p>
          </CardContent>
        </Card>

        {/* Understanding Distribution */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-[#6b8e7f]" />
              Understanding Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={understandingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.level}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {understandingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {understandingData.map((item) => (
                <div key={item.level} className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700">{item.level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-l-4 border-l-[#d4a574] shadow-md bg-gradient-to-br from-white to-[#fdfbf7]">
        <CardHeader>
          <CardTitle>AI-Powered Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">Focus on Recursion</h4>
              <p className="text-sm text-indigo-700">
                Consider dedicating an extra session to recursion concepts. 29% of students are struggling with this topic.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Quiz Performance Improving</h4>
              <p className="text-sm text-green-700">
                Quiz scores show an upward trend. Your current teaching approach is effective for assessment preparation.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Participation Opportunity</h4>
              <p className="text-sm text-purple-700">
                Consider adding more interactive elements to lectures to boost the 87% participation rate closer to attendance levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}