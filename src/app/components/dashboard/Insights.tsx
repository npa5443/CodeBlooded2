import { AlertTriangle, BarChart3, TrendingDown, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CourseInsights } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface InsightsProps {
  insights: CourseInsights;
}

const recommendationToneClasses = {
  indigo: "bg-indigo-50 text-indigo-700 text-indigo-900",
  green: "bg-green-50 text-green-700 text-green-900",
  purple: "bg-purple-50 text-purple-700 text-purple-900",
} as const;

export function Insights({ insights }: InsightsProps) {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-[#8b3a3a]/20 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-[#8b3a3a]" />
            Student Weak Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.weakPoints.map((point) => (
              <div key={point.id} className="space-y-2 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{point.topic}</h4>
                    {point.trend === "increasing" ? (
                      <TrendingDown className="size-4 text-red-500 rotate-180" />
                    ) : null}
                    {point.trend === "decreasing" ? (
                      <TrendingDown className="size-4 text-green-500" />
                    ) : null}
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
            {insights.weakPoints.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                This course needs a bit more student data before weak points appear.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-[#2d4263]" />
              Quiz Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights.quizTrends}>
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
                  data={insights.understandingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.level}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {insights.understandingData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {insights.understandingData.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700">{item.level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-[#d4a574] shadow-md bg-gradient-to-br from-white to-[#fdfbf7]">
        <CardHeader>
          <CardTitle>Teaching Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.recommendations.map((recommendation) => {
              const [backgroundClass, bodyClass, headingClass] =
                recommendationToneClasses[recommendation.tone].split(" ");

              return (
                <div key={recommendation.id} className={`p-4 rounded-lg ${backgroundClass}`}>
                  <h4 className={`font-medium ${headingClass} mb-2`}>{recommendation.title}</h4>
                  <p className={`text-sm ${bodyClass}`}>{recommendation.body}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
