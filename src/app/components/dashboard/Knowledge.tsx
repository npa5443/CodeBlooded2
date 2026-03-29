import { format } from "date-fns";
import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Search,
  Upload,
} from "lucide-react";
import { downloadDataUrl, formatFileSize, readFileAsDataUrl } from "../../lib/files";
import type { CourseKnowledge, MaterialStatus } from "../../lib/types";
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

const categoryClassNames: Record<string, string> = {
  Syllabus: "bg-[#2d4263] text-white hover:bg-[#1a2a3f]",
  Textbooks: "bg-[#6b8e7f] text-white hover:bg-[#5a7a6d]",
  "Lecture Notes": "bg-[#8b3a3a] text-white hover:bg-[#752f2f]",
  Assignments: "bg-[#d4a574] text-[#1a1a2e] hover:bg-[#c4956a]",
  Readings: "bg-[#8b7355] text-white hover:bg-[#75614a]",
};

interface KnowledgeProps {
  knowledge: CourseKnowledge;
  onAddMaterial: (payload: {
    name: string;
    category: string;
    type: string;
    sizeLabel: string;
    fileName?: string;
    mimeType?: string;
    fileDataUrl?: string | null;
  }) => Promise<void>;
  onUpdateMaterialStatus: (
    materialId: string,
    status: MaterialStatus,
  ) => Promise<void>;
  onImportGradeData: (payload: {
    fileName: string;
    fileDataUrl: string;
  }) => Promise<void>;
}

function getStatusBadge(status: MaterialStatus) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <CheckCircle className="size-3 mr-1" />
          Approved
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
          <Clock className="size-3 mr-1" />
          Pending
        </Badge>
      );
    case "review":
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
          <AlertCircle className="size-3 mr-1" />
          Review
        </Badge>
      );
    default:
      return null;
  }
}

function inferMaterialType(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    return "PDF";
  }
  if (extension === "doc" || extension === "docx") {
    return "DOCX";
  }
  if (extension === "ppt" || extension === "pptx") {
    return "PPTX";
  }
  if (extension === "csv") {
    return "CSV";
  }
  if (extension === "txt" || extension === "md") {
    return "Text";
  }

  return file.type.split("/")[1]?.toUpperCase() || "File";
}

function fileNameToTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").trim() || fileName;
}

export function Knowledge({
  knowledge,
  onAddMaterial,
  onUpdateMaterialStatus,
  onImportGradeData,
}: KnowledgeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportingGrades, setIsImportingGrades] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    name: "",
    category: "Assignments",
    type: "PDF",
    sizeLabel: "",
    fileName: "",
    mimeType: "",
    fileDataUrl: "",
  });
  const materialInputRef = useRef<HTMLInputElement | null>(null);
  const gradeInputRef = useRef<HTMLInputElement | null>(null);

  const filteredMaterials = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return knowledge.materials.filter((material) => {
      const matchesQuery =
        !query ||
        [material.name, material.category, material.type, material.uploadedBy]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesCategory = !selectedCategory || material.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [knowledge.materials, searchQuery, selectedCategory]);

  const selectedMaterial =
    knowledge.materials.find((material) => material.id === selectedMaterialId) ?? null;

  const handleMaterialFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const fileDataUrl = await readFileAsDataUrl(file);
    setMaterialForm((current) => ({
      ...current,
      name: current.name || fileNameToTitle(file.name),
      type: inferMaterialType(file),
      sizeLabel: formatFileSize(file.size),
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileDataUrl,
    }));
  };

  const handleMaterialSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onAddMaterial({
        name: materialForm.name,
        category: materialForm.category,
        type: materialForm.type,
        sizeLabel: materialForm.sizeLabel,
        fileName: materialForm.fileName || undefined,
        mimeType: materialForm.mimeType || undefined,
        fileDataUrl: materialForm.fileDataUrl || null,
      });
      setMaterialForm({
        name: "",
        category: "Assignments",
        type: "PDF",
        sizeLabel: "",
        fileName: "",
        mimeType: "",
        fileDataUrl: "",
      });
      setIsUploadOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGradeImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsImportingGrades(true);

    try {
      await onImportGradeData({
        fileName: file.name,
        fileDataUrl: await readFileAsDataUrl(file),
      });
    } finally {
      setIsImportingGrades(false);
    }
  };

  return (
    <div className="space-y-6">
      <input
        ref={gradeInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleGradeImport}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search materials..."
            className="pl-10"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <Button
          className="bg-[#1a1a2e] hover:bg-[#2d3250]"
          onClick={() => setIsUploadOpen(true)}
          type="button"
        >
          <Upload className="size-4 mr-2" />
          Upload Material
        </Button>
      </div>

      <Card className="shadow-md border-[#d4a574]/20">
        <CardHeader>
          <CardTitle>Material Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                selectedCategory === null
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All Materials
              <span className="ml-2 opacity-80">({knowledge.materials.length})</span>
            </button>
            {knowledge.categories.map((category) => (
              <button
                key={category.name}
                type="button"
                className={`px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105 shadow-sm ${
                  selectedCategory === category.name
                    ? "ring-2 ring-offset-2 ring-[#1a1a2e]"
                    : ""
                } ${
                  categoryClassNames[category.name] ??
                  "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() =>
                  setSelectedCategory((current) =>
                    current === category.name ? null : category.name,
                  )
                }
              >
                {category.name}
                <span className="ml-2 opacity-80">({category.count})</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-[#d4a574]/20">
        <CardHeader>
          <CardTitle>Course Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#d4a574]/30 hover:shadow-md transition-all group"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#2d3250] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="size-6 text-[#d4a574]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">{material.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>{material.category}</span>
                        <span>•</span>
                        <span>{material.type}</span>
                        <span>•</span>
                        <span>{material.sizeLabel}</span>
                        <span>•</span>
                        <span>Uploaded by {material.uploadedBy}</span>
                        <span>•</span>
                        <span>{format(new Date(material.uploadedAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {getStatusBadge(material.status)}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedMaterialId(material.id)}
                          type="button"
                        >
                          View
                        </Button>
                        {material.status !== "approved" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateMaterialStatus(material.id, "review")}
                              type="button"
                            >
                              Review
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#1a1a2e] hover:bg-[#2d3250]"
                              onClick={() =>
                                onUpdateMaterialStatus(material.id, "approved")
                              }
                              type="button"
                            >
                              Approve
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredMaterials.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                No materials matched your current search and category filters.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

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
              Upload CSV files containing student grades to analyze performance trends
              and identify areas for improvement.
            </p>
            <button
              type="button"
              className="w-full border-2 border-dashed border-[#d4a574]/30 rounded-xl p-8 text-center hover:border-[#d4a574] hover:bg-[#fdfbf7] transition-all"
              onClick={() => gradeInputRef.current?.click()}
              disabled={isImportingGrades}
            >
              <Upload className="size-12 text-[#d4a574] mx-auto mb-3" />
              <p className="font-medium text-gray-900 mb-1">
                {isImportingGrades ? "Importing CSV..." : "Choose a CSV file to import"}
              </p>
              <p className="text-sm text-gray-500">
                Click to upload a grade export directly from your computer.
              </p>
            </button>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="size-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                i
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">CSV Format Guidelines</p>
                <p className="text-blue-700">
                  Include columns like student name, assignment or quiz name, and
                  score. Example: "John Doe,Quiz 1,85"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Material</DialogTitle>
            <DialogDescription>
              Add a course resource from your computer to the materials library.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleMaterialSubmit}>
            <input
              ref={materialInputRef}
              type="file"
              className="hidden"
              onChange={handleMaterialFileChange}
            />
            <div className="space-y-2">
              <Label>Selected file</Label>
              <div className="rounded-xl border border-dashed border-gray-300 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    {materialForm.fileName ? materialForm.fileName : "No file selected yet."}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => materialInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-name">Material name</Label>
              <Input
                id="material-name"
                value={materialForm.name}
                onChange={(event) =>
                  setMaterialForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material-category">Category</Label>
                <Input
                  id="material-category"
                  value={materialForm.category}
                  onChange={(event) =>
                    setMaterialForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-type">Type</Label>
                <Input
                  id="material-type"
                  value={materialForm.type}
                  onChange={(event) =>
                    setMaterialForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-size">Size label</Label>
              <Input
                id="material-size"
                placeholder="e.g. 245 KB"
                value={materialForm.sizeLabel}
                onChange={(event) =>
                  setMaterialForm((current) => ({
                    ...current,
                    sizeLabel: event.target.value,
                  }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !materialForm.fileDataUrl}
              >
                {isSubmitting ? "Uploading..." : "Upload Material"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedMaterial)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMaterialId(null);
          }
        }}
      >
        <DialogContent>
          {selectedMaterial ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMaterial.name}</DialogTitle>
                <DialogDescription>
                  Material details from the backend-backed course library.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Category</p>
                    <p>{selectedMaterial.category}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Type</p>
                    <p>{selectedMaterial.type}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedMaterial.status)}</div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Size</p>
                    <p>{selectedMaterial.sizeLabel}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Uploaded By</p>
                  <p>{selectedMaterial.uploadedBy}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Uploaded On</p>
                  <p>{format(new Date(selectedMaterial.uploadedAt), "MMMM d, yyyy")}</p>
                </div>
                {selectedMaterial.fileName ? (
                  <div>
                    <p className="font-medium text-gray-900">Stored File</p>
                    <p>{selectedMaterial.fileName}</p>
                  </div>
                ) : null}
              </div>
              <DialogFooter>
                {selectedMaterial.fileDataUrl && selectedMaterial.fileName ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      downloadDataUrl(
                        selectedMaterial.fileDataUrl!,
                        selectedMaterial.fileName!,
                      )
                    }
                  >
                    <Download className="size-4 mr-2" />
                    Download
                  </Button>
                ) : null}
                <Button type="button" onClick={() => setSelectedMaterialId(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
