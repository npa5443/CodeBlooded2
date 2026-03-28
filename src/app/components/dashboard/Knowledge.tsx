import { FileText, Upload, CheckCircle, Clock, AlertCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  students: number;
}

interface KnowledgeProps {
  course: Course;
}

export function Knowledge({ course }: KnowledgeProps) {
  const materials = [
    {
      name: "Course Syllabus 2026",
      type: "PDF",
      status: "approved",
      uploadedBy: "Dr. Smith",
      date: "Jan 15, 2026",
      size: "245 KB",
    },
    {
      name: "Textbook: Introduction to CS",
      type: "PDF",
      status: "approved",
      uploadedBy: "Dr. Smith",
      date: "Jan 15, 2026",
      size: "12.4 MB",
    },
    {
      name: "Lecture Notes - Week 1-4",
      type: "PDF",
      status: "approved",
      uploadedBy: "Dr. Smith",
      date: "Feb 1, 2026",
      size: "1.8 MB",
    },
    {
      name: "Assignment 5 Instructions",
      type: "DOCX",
      status: "pending",
      uploadedBy: "TA: John Doe",
      date: "Mar 20, 2026",
      size: "156 KB",
    },
    {
      name: "Practice Problems Set 3",
      type: "PDF",
      status: "review",
      uploadedBy: "TA: Sarah Lee",
      date: "Mar 22, 2026",
      size: "890 KB",
    },
  ];

  const categories = [
    { name: "Syllabus", count: 1, color: "bg-[#2d4263] text-white hover:bg-[#1a2a3f]" },
    { name: "Textbooks", count: 3, color: "bg-[#6b8e7f] text-white hover:bg-[#5a7a6d]" },
    { name: "Lecture Notes", count: 12, color: "bg-[#8b3a3a] text-white hover:bg-[#752f2f]" },
    { name: "Assignments", count: 8, color: "bg-[#d4a574] text-[#1a1a2e] hover:bg-[#c4956a]" },
    { name: "Readings", count: 15, color: "bg-[#8b7355] text-white hover:bg-[#75614a]" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="size-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="size-3 mr-1" />Pending</Badge>;
      case "review":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><AlertCircle className="size-3 mr-1" />Review</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input placeholder="Search materials..." className="pl-10" />
        </div>
        <Button className="bg-[#1a1a2e] hover:bg-[#2d3250]">
          <Upload className="size-4 mr-2" />
          Upload Material
        </Button>
      </div>

      {/* Categories */}
      <Card className="shadow-md border-[#d4a574]/20">
        <CardHeader>
          <CardTitle>Material Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105 shadow-sm ${category.color}`}
              >
                {category.name}
                <span className="ml-2 opacity-80">({category.count})</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      <Card className="shadow-md border-[#d4a574]/20">
        <CardHeader>
          <CardTitle>Course Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {materials.map((material, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#d4a574]/30 hover:shadow-md transition-all group"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#2d3250] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="size-6 text-[#d4a574]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">{material.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{material.type}</span>
                        <span>•</span>
                        <span>{material.size}</span>
                        <span>•</span>
                        <span>Uploaded by {material.uploadedBy}</span>
                        <span>•</span>
                        <span>{material.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {getStatusBadge(material.status)}
                      {material.status === "pending" || material.status === "review" ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Review</Button>
                          <Button size="sm" className="bg-[#1a1a2e] hover:bg-[#2d3250]">Approve</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline">View</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CSV Import for Student Data */}
      <Card className="border-2 border-[#d4a574]/30 bg-gradient-to-br from-[#fdfbf7] to-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5 text-[#d4a574]" />
            Import Student Grade Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload CSV files containing student grades to analyze performance trends and identify areas for improvement.
            </p>
            <div className="border-2 border-dashed border-[#d4a574]/30 rounded-xl p-8 text-center hover:border-[#d4a574] hover:bg-[#fdfbf7] transition-all cursor-pointer group">
              <Upload className="size-12 text-[#d4a574] mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900 mb-1">Drop your CSV file here or click to browse</p>
              <p className="text-sm text-gray-500">Supports .csv files up to 10MB</p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="size-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">i</div>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">CSV Format Guidelines</p>
                <p className="text-blue-700">Include columns: Student ID, Name, Assignment/Quiz, Score. Example: "12345,John Doe,Assignment 1,85"</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
