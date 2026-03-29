import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  FileUp,
  Lightbulb,
  Sparkles,
  Upload,
} from "lucide-react";
import type {
  CourseSlides,
  SlideSuggestionStatus,
} from "../../lib/types";
import { downloadFilePayload } from "../../lib/files";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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

interface SlidesProps {
  slides: CourseSlides;
  onCreateDeck: (payload: {
    title: string;
    slides: number;
    keyPoints?: string;
    source?: string;
  }) => Promise<void>;
  onGenerateSuggestions: (presentationId: string) => Promise<void>;
  onSuggestionAction: (
    suggestionId: string,
    status: SlideSuggestionStatus,
  ) => Promise<void>;
  onExportPresentation: (
    presentationId: string,
    format: "pdf" | "pptx",
  ) => Promise<{
    fileName: string;
    mimeType: string;
    base64: string;
    id: string;
  }>;
}

export function Slides({
  slides,
  onCreateDeck,
  onGenerateSuggestions,
  onSuggestionAction,
  onExportPresentation,
}: SlidesProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [previewState, setPreviewState] = useState<{
    presentationId: string;
    slideIndex: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [suggestionGenerationId, setSuggestionGenerationId] = useState<string | null>(null);
  const [suggestionActionId, setSuggestionActionId] = useState<string | null>(null);
  const [exportPresentationId, setExportPresentationId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "pptx">("pdf");
  const [exportSubmitting, setExportSubmitting] = useState(false);
  const [deckForm, setDeckForm] = useState({
    title: "",
    slides: "20",
    keyPoints: "",
  });
  const [uploadForm, setUploadForm] = useState({
    title: "",
    slides: "24",
  });

  const previewPresentation = useMemo(
    () =>
      slides.presentations.find(
        (presentation) => presentation.id === previewState?.presentationId,
      ) ?? null,
    [previewState?.presentationId, slides.presentations],
  );
  const previewSlideIndex = previewState?.slideIndex ?? 0;
  const previewSlide = previewPresentation?.content?.[previewSlideIndex] ?? null;
  const overallScore =
    slides.clarityScores.length > 0
      ? Math.round(
          slides.clarityScores.reduce((total, metric) => total + metric.score, 0) /
            slides.clarityScores.length,
        )
      : 0;

  const handleCreateDeck = async (source: string) => {
    setIsSubmitting(true);

    try {
      await onCreateDeck({
        title: deckForm.title,
        slides: Number(deckForm.slides),
        keyPoints: deckForm.keyPoints,
        source,
      });
      setDeckForm({
        title: "",
        slides: "20",
        keyPoints: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDeck = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadSubmitting(true);

    try {
      await onCreateDeck({
        title: uploadForm.title,
        slides: Number(uploadForm.slides),
        source: "upload",
      });
      setUploadForm({
        title: "",
        slides: "24",
      });
      setIsUploadDialogOpen(false);
    } finally {
      setUploadSubmitting(false);
    }
  };

  const handleGenerateSuggestions = async (presentationId: string) => {
    setSuggestionGenerationId(presentationId);

    try {
      await onGenerateSuggestions(presentationId);
    } finally {
      setSuggestionGenerationId(null);
    }
  };

  const handleSuggestionAction = async (
    suggestionId: string,
    status: SlideSuggestionStatus,
  ) => {
    setSuggestionActionId(suggestionId);

    try {
      await onSuggestionAction(suggestionId, status);
    } finally {
      setSuggestionActionId(null);
    }
  };

  const openPreview = (presentationId: string, slideIndex = 0) => {
    setPreviewState({
      presentationId,
      slideIndex,
    });
  };

  const handleDownload = async () => {
    if (!exportPresentationId) {
      return;
    }

    setExportSubmitting(true);

    try {
      const file = await onExportPresentation(exportPresentationId, exportFormat);
      downloadFilePayload(file);
      setExportPresentationId(null);
    } finally {
      setExportSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Presentation Management
          </h2>
          <p className="text-sm text-gray-600">
            Create new slide decks or enhance existing presentations with
            backend-backed suggestions.
          </p>
        </div>
        <Button
          className="bg-[#1a1a2e] hover:bg-[#2d3250]"
          onClick={() => setIsUploadDialogOpen(true)}
        >
          <FileUp className="size-4 mr-2" />
          Upload Existing Slides
        </Button>
      </div>

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
                <Input
                  id="topic"
                  placeholder="e.g., Binary Search Trees"
                  value={deckForm.title}
                  onChange={(event) =>
                    setDeckForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slides-count">Number of Slides</Label>
                <Input
                  id="slides-count"
                  type="number"
                  placeholder="e.g., 30"
                  value={deckForm.slides}
                  onChange={(event) =>
                    setDeckForm((current) => ({
                      ...current,
                      slides: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-points">Key Points to Cover</Label>
              <Textarea
                id="key-points"
                rows={4}
                placeholder="Enter the main concepts, topics, or learning objectives you want to cover in this presentation..."
                className="resize-none"
                value={deckForm.keyPoints}
                onChange={(event) =>
                  setDeckForm((current) => ({
                    ...current,
                    keyPoints: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference-material">Reference Material (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#d4a574] hover:bg-[#fdfbf7] transition-all">
                <Upload className="size-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Reference uploads can be layered in next. The deck metadata is already
                  saved to the backend.
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or TXT up to 20MB</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-[#1a1a2e] to-[#2d3250] hover:opacity-90 shadow-md"
                disabled={isSubmitting}
                onClick={() => void handleCreateDeck("generated")}
              >
                <Sparkles className="size-4 mr-2" />
                {isSubmitting ? "Generating..." : "Generate Slides with AI"}
              </Button>
              <Button
                variant="outline"
                className="px-6"
                disabled={isSubmitting}
                onClick={() => void handleCreateDeck("draft")}
              >
                Save Draft
              </Button>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="size-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                i
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">AI Slide Generation</p>
                <p className="text-blue-700">
                  Generated decks and suggestion runs use Gemini when a server key is
                  configured, and unsafe or illegal instructional requests are blocked
                  before content is returned.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Your Presentations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {slides.presentations.map((presentation) => (
              <div
                key={presentation.id}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#d4a574]/30 hover:shadow-md transition-all group"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#2d3250] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="size-6 text-[#d4a574]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {presentation.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>{presentation.slides} slides</span>
                        <span>•</span>
                        <span>
                          Last edited{" "}
                          {formatDistanceToNow(new Date(presentation.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {presentation.generatedWith === "gemini" ? (
                          <>
                            <span>•</span>
                            <span>Gemini</span>
                          </>
                        ) : null}
                      </div>
                      {presentation.summary ? (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {presentation.summary}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {presentation.status === "reviewed" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle2 className="size-3 mr-1" />
                          Reviewed
                        </Badge>
                      ) : null}
                      {presentation.status === "needs-review" ? (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                          <AlertCircle className="size-3 mr-1" />
                          {presentation.suggestionCount} Suggestions
                        </Badge>
                      ) : null}
                      {presentation.status === "draft" ? (
                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          Draft
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPreview(presentation.id)}
                    >
                      <Eye className="size-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={suggestionGenerationId === presentation.id}
                      onClick={() => void handleGenerateSuggestions(presentation.id)}
                    >
                      <Lightbulb className="size-3 mr-1" />
                      {suggestionGenerationId === presentation.id
                        ? "Generating..."
                        : "Get Suggestions"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExportPresentationId(presentation.id)}
                    >
                      <Download className="size-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {slides.presentations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                No presentations yet. Generate a deck or upload an existing lecture to
                get started.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[#d4a574] shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="size-5 text-[#d4a574]" />
            Presentation Enhancement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {slides.suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
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
                  {suggestion.priority === "high" ? (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      High Priority
                    </Badge>
                  ) : null}
                </div>
                <p className="text-gray-700 mb-3">{suggestion.suggestion}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-[#1a1a2e] hover:bg-[#2d3250]"
                    disabled={suggestionActionId === suggestion.id}
                    onClick={() =>
                      void handleSuggestionAction(suggestion.id, "applied")
                    }
                  >
                    {suggestionActionId === suggestion.id
                      ? "Applying..."
                      : "Apply Suggestion"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      openPreview(
                        suggestion.presentationId,
                        Math.max(0, suggestion.slide - 1),
                      )
                    }
                  >
                    View Slide
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={suggestionActionId === suggestion.id}
                    onClick={() =>
                      void handleSuggestionAction(suggestion.id, "dismissed")
                    }
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
            {slides.suggestions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                No open suggestions right now. Your slide quality queue is clear.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Presentation Quality Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {slides.presentations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
              Generate or upload a presentation to see readability and structure
              metrics here.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {slides.clarityScores.map((metric) => (
                  <div key={metric.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{metric.category}</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {metric.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${metric.colorClass} h-3 rounded-full transition-all`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-[#1a1a2e] to-[#2d3250] rounded-xl text-white">
                <p className="text-sm">
                  <strong>Overall Score: {overallScore}%</strong>{" "}
                  {overallScore >= 80
                    ? "Your presentations are in strong shape. Keep refining for polish."
                    : "There is room to tighten slide clarity and flow before the next class."}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Existing Slides</DialogTitle>
            <DialogDescription>
              Save slide metadata to the backend so the deck appears across sessions.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUploadDeck}>
            <div className="space-y-2">
              <Label htmlFor="upload-title">Presentation title</Label>
              <Input
                id="upload-title"
                value={uploadForm.title}
                onChange={(event) =>
                  setUploadForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-slides">Slide count</Label>
              <Input
                id="upload-slides"
                type="number"
                min="1"
                value={uploadForm.slides}
                onChange={(event) =>
                  setUploadForm((current) => ({
                    ...current,
                    slides: event.target.value,
                  }))
                }
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploadSubmitting}>
                {uploadSubmitting ? "Saving..." : "Save Deck"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(previewState && previewPresentation && previewSlide)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewState(null);
          }
        }}
      >
        <DialogContent className="max-w-5xl w-[min(96vw,1100px)] max-h-[92vh] overflow-hidden flex flex-col p-0">
          {previewPresentation && previewSlide ? (
            <>
              <DialogHeader className="px-6 pt-6 pb-3 border-b border-gray-200">
                <DialogTitle>{previewPresentation.title}</DialogTitle>
                <DialogDescription>
                  Slide {previewSlideIndex + 1} of {previewPresentation.content.length}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="rounded-[28px] overflow-hidden border border-[#d4a574]/30 bg-gradient-to-br from-[#f7f2e8] via-[#fbfaf7] to-white shadow-xl">
                  <div className="h-4 bg-gradient-to-r from-[#1a1a2e] via-[#2d4263] to-[#d4a574]" />
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.24em] text-[#8b7355] mb-3">
                          Slide {previewSlideIndex + 1}
                        </p>
                        <h3 className="text-3xl font-semibold text-[#1a1a2e] leading-tight">
                          {previewSlide.title}
                        </h3>
                      </div>
                      {previewPresentation.summary ? (
                        <div className="max-w-sm rounded-2xl border border-[#d4a574]/30 bg-white/90 px-4 py-3 text-sm text-[#6b5235] shadow-sm">
                          {previewPresentation.summary}
                        </div>
                      ) : null}
                    </div>
                    <ul className="grid gap-3 md:grid-cols-2">
                      {previewSlide.bullets.map((bullet, index) => (
                        <li
                          key={`${previewSlide.title}-${index}`}
                          className="rounded-2xl border border-[#d4a574]/20 bg-white px-5 py-4 text-gray-700 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 size-2.5 rounded-full bg-[#d4a574] flex-shrink-0" />
                            <span>{bullet}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="rounded-2xl bg-[#1a1a2e] px-5 py-5 text-sm text-white/90 shadow-lg">
                      <p className="font-medium text-white mb-2 uppercase tracking-[0.16em] text-xs">
                        Speaker Notes
                      </p>
                      <p className="leading-6">
                        {previewSlide.speakerNotes ?? "No speaker notes yet for this slide."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between border-t border-gray-200 px-6 py-4 bg-white">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={previewSlideIndex === 0}
                    onClick={() =>
                      setPreviewState((current) =>
                        current
                          ? {
                              ...current,
                              slideIndex: Math.max(0, current.slideIndex - 1),
                            }
                          : current,
                      )
                    }
                  >
                    <ChevronLeft className="size-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      previewSlideIndex >= previewPresentation.content.length - 1
                    }
                    onClick={() =>
                      setPreviewState((current) =>
                        current
                          ? {
                              ...current,
                              slideIndex: Math.min(
                                previewPresentation.content.length - 1,
                                current.slideIndex + 1,
                              ),
                            }
                          : current,
                      )
                    }
                  >
                    Next
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={() => setExportPresentationId(previewPresentation.id)}
                >
                  <Download className="size-4 mr-2" />
                  Download
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(exportPresentationId)}
        onOpenChange={(open) => {
          if (!open) {
            setExportPresentationId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Slideshow</DialogTitle>
            <DialogDescription>
              Choose a file type for this presentation export.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="slide-download-format">Export format</Label>
            <Select
              value={exportFormat}
              onValueChange={(value) => setExportFormat(value as "pdf" | "pptx")}
            >
              <SelectTrigger id="slide-download-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF slideshow</SelectItem>
                <SelectItem value="pptx">PowerPoint (.pptx)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setExportPresentationId(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={exportSubmitting} onClick={() => void handleDownload()}>
              {exportSubmitting ? "Exporting..." : "Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
