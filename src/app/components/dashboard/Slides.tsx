import { FileText, Upload, Eye, Lightbulb, CheckCircle2, AlertCircle, Download, Sparkles, FileUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  students: number;
}

interface SlidesProps {
  course: Course;
}

export function Slides({ course }: SlidesProps) {
  const presentations = [
    {
      title: "Lecture 9: Binary Search Trees",
      slides: 42,
      lastEdited: "2 hours ago",
      status: "reviewed",
      suggestions: 0,
    },
    {
      title: "Lecture 10: Tree Traversal Methods",
      slides: 38,
      lastEdited: "1 day ago",
      status: "needs-review",
      suggestions: 3,
    },
    {
      title: "Lecture 11: AVL Trees & Balancing",
      slides: 45,
      lastEdited: "3 days ago",
      status: "draft",
      suggestions: 5,
    },
    {
      title: "Midterm Review Session",
      slides: 28,
      lastEdited: "5 days ago",
      status: "reviewed",
      suggestions: 0,
    },
  ];

  const suggestions = [
    {
      presentation: "Lecture 10: Tree Traversal Methods",
      slide: 5,
      type: "clarity",
      suggestion: "Consider adding a visual diagram to illustrate the concept",
      priority: "high",
    },
    {
      presentation: "Lecture 10: Tree Traversal Methods",
      slide: 12,
      type: "readability",
      suggestion: "Text density is high. Break into 2 slides or use bullet points",
      priority: "medium",
    },
    {
      presentation: "Lecture 11: AVL Trees & Balancing",
      slide: 8,
      type: "engagement",
      suggestion: "Add an interactive example or exercise for students",
      priority: "high",
    },
    {
      presentation: "Lecture 11: AVL Trees & Balancing",
      slide: 15,
      type: "clarity",
      suggestion: "Code snippet could benefit from syntax highlighting",
      priority: "low",
    },
  ];

  const clarityScores = [
    { category: "Visual Aids", score: 92, color: "bg-[#6b8e7f]" },
    { category: "Text Clarity", score: 78, color: "bg-[#d4a574]" },
    { category: "Code Examples", score: 85, color: "bg-[#2d4263]" },
    { category: "Organization", score: 88, color: "bg-[#6b8e7f]" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Presentation Management</h2>
          <p className="text-sm text-gray-600">Create new slides or enhance existing presentations with AI-powered suggestions</p>
        </div>
        <Button className="bg-[#1a1a2e] hover:bg-[#2d3250]">
          <FileUp className="size-4 mr-2" />
          Upload Existing Slides
        </Button>
      </div>

      {/* Create New Slides */}
      <Card className="border-2 border-[#d4a574]/30 shadow-lg bg-gradient-to-br from-white via-[#fdfbf7] to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-[#d4a574]" />
            Create New Slide Deck
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Lecture Topic</Label>
                <Input id="topic" placeholder="e.g., Binary Search Trees" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slides-count">Number of Slides</Label>
                <Input id="slides-count" type="number" placeholder="e.g., 30" defaultValue="20" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-points">Key Points to Cover</Label>
              <Textarea
                id="key-points"
                rows={4}
                placeholder="Enter the main concepts, topics, or learning objectives you want to cover in this presentation..."
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference-material">Reference Material (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#d4a574] hover:bg-[#fdfbf7] transition-all cursor-pointer group">
                <Upload className="size-10 text-gray-400 mx-auto mb-2 group-hover:text-[#d4a574] group-hover:scale-110 transition-all" />
                <p className="text-sm text-gray-600">Upload textbook chapters, papers, or notes to base slides on</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or TXT up to 20MB</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-[#1a1a2e] to-[#2d3250] hover:opacity-90 shadow-md">
                <Sparkles className="size-4 mr-2" />
                Generate Slides with AI
              </Button>
              <Button variant="outline" className="px-6">
                Save Draft
              </Button>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="size-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">i</div>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">AI Slide Generation</p>
                <p className="text-blue-700">Our AI will create professional, educational slides based on your topic, key points, and reference materials. You can edit and customize them afterwards.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Presentations List */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Your Presentations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {presentations.map((presentation, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#d4a574]/30 hover:shadow-md transition-all group"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#2d3250] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="size-6 text-[#d4a574]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{presentation.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{presentation.slides} slides</span>
                        <span>•</span>
                        <span>Last edited {presentation.lastEdited}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {presentation.status === "reviewed" && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle2 className="size-3 mr-1" />
                          Reviewed
                        </Badge>
                      )}
                      {presentation.status === "needs-review" && (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                          <AlertCircle className="size-3 mr-1" />
                          {presentation.suggestions} Suggestions
                        </Badge>
                      )}
                      {presentation.status === "draft" && (
                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="size-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Lightbulb className="size-3 mr-1" />
                      Get Suggestions
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="size-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhancement: AI Suggestions for Existing Slides */}
      <Card className="border-l-4 border-l-[#d4a574] shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="size-5 text-[#d4a574]" />
            AI-Powered Enhancement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  suggestion.priority === "high"
                    ? "border-orange-200 bg-orange-50"
                    : suggestion.priority === "medium"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {suggestion.presentation} - Slide {suggestion.slide}
                    </h4>
                    <Badge
                      className={`${
                        suggestion.type === "clarity"
                          ? "bg-blue-100 text-blue-700"
                          : suggestion.type === "readability"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      } hover:bg-opacity-100`}
                    >
                      {suggestion.type}
                    </Badge>
                  </div>
                  {suggestion.priority === "high" && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">High Priority</Badge>
                  )}
                </div>
                <p className="text-gray-700 mb-3">{suggestion.suggestion}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#1a1a2e] hover:bg-[#2d3250]">Apply Suggestion</Button>
                  <Button size="sm" variant="outline">
                    View Slide
                  </Button>
                  <Button size="sm" variant="ghost">
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clarity Scores */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Presentation Quality Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clarityScores.map((metric, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{metric.category}</span>
                  <span className="text-sm font-semibold text-gray-700">{metric.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${metric.color} h-3 rounded-full transition-all`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-[#1a1a2e] to-[#2d3250] rounded-xl text-white">
            <p className="text-sm">
              <strong>Overall Score: 86%</strong> - Your presentations are well-structured and engaging. Focus on
              improving text clarity to reach excellence.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Presentation Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#2d4263]/10 rounded-xl border-2 border-[#2d4263]/20 hover:border-[#2d4263]/40 transition-all">
              <h4 className="font-medium text-[#1a1a2e] mb-2">Use Visual Aids</h4>
              <p className="text-sm text-gray-700">
                Incorporate diagrams, charts, and images to reinforce complex concepts
              </p>
            </div>
            <div className="p-4 bg-[#6b8e7f]/10 rounded-xl border-2 border-[#6b8e7f]/20 hover:border-[#6b8e7f]/40 transition-all">
              <h4 className="font-medium text-[#1a1a2e] mb-2">Keep Text Minimal</h4>
              <p className="text-sm text-gray-700">
                Use bullet points and concise statements instead of paragraphs
              </p>
            </div>
            <div className="p-4 bg-[#8b3a3a]/10 rounded-xl border-2 border-[#8b3a3a]/20 hover:border-[#8b3a3a]/40 transition-all">
              <h4 className="font-medium text-[#1a1a2e] mb-2">Interactive Elements</h4>
              <p className="text-sm text-gray-700">
                Include exercises and examples that engage students actively
              </p>
            </div>
            <div className="p-4 bg-[#d4a574]/10 rounded-xl border-2 border-[#d4a574]/20 hover:border-[#d4a574]/40 transition-all">
              <h4 className="font-medium text-[#1a1a2e] mb-2">Consistent Style</h4>
              <p className="text-sm text-gray-700">
                Maintain uniform fonts, colors, and layouts throughout your deck
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
