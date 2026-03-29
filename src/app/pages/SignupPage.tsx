import { BrandLogo } from "../components/common/BrandLogo";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "../lib/auth";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLegalDocument, setActiveLegalDocument] = useState<
    "terms" | "privacy" | null
  >(null);

  const legalCopy = {
    terms: {
      title: "Terms of Service",
      description:
        "Sylla is intended for lawful academic planning and teaching support. You are responsible for the course materials, student data, and AI prompts you submit.",
    },
    privacy: {
      title: "Privacy Policy",
      description:
        "Sylla stores your account information and course data locally for this app. Only use approved content in prompts and uploads, and avoid entering restricted student data unless you are authorized to handle it.",
    },
  } as const;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signup(formData);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef5f4] via-[#f9fbfb] to-[#eef0e4] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo className="mb-6" textClassName="text-gray-900" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Start your free trial today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Dr. Jane Smith"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="professor@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                type="text"
                placeholder="Stanford University"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="text-xs text-gray-600">
              By signing up, you agree to our{" "}
              <button
                type="button"
                className="text-[#3d89b8] hover:text-[#27485a]"
                onClick={() => setActiveLegalDocument("terms")}
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="text-[#3d89b8] hover:text-[#27485a]"
                onClick={() => setActiveLegalDocument("privacy")}
              >
                Privacy Policy
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#3d89b8] hover:text-[#27485a] font-medium"
            >
              Sign in
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>

      <Dialog
        open={Boolean(activeLegalDocument)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveLegalDocument(null);
          }
        }}
      >
        <DialogContent>
          {activeLegalDocument ? (
            <>
              <DialogHeader>
                <DialogTitle>{legalCopy[activeLegalDocument].title}</DialogTitle>
                <DialogDescription>
                  {legalCopy[activeLegalDocument].description}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" onClick={() => setActiveLegalDocument(null)}>
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
