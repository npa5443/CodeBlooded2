import { useRef } from "react";
import { BookOpen, LineChart, Calendar, Layout, Lightbulb, ChevronRight, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "../components/common/BrandLogo";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useNavigate } from "react-router";

export function LandingPage() {
  const navigate = useNavigate();
  const demoSectionRef = useRef<HTMLElement | null>(null);

  const scrollToDemo = () => {
    demoSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scheduleDemo = () => {
    window.location.href =
      "mailto:demo@sylla.app?subject=Sylla%20Demo%20Request&body=Hi%20Sylla%2C%0A%0AI'd%20like%20to%20schedule%20a%20demo%20for%20my%20teaching%20team.%0A%0AThanks!";
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      {/* Header */}
      <header className="border-b border-[#d3b46f]/20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")} className="hover:bg-[#e8f0ef] text-[#27485a]">
              Log In
            </Button>
            <Button onClick={() => navigate("/signup")} className="bg-[#27485a] hover:bg-[#31556b] text-white shadow-md">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f4f7f6] via-[#f8fbfa] to-[#edf1e8]">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#4f9ccc] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8db889] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e4f0f7] text-[#31556b] text-sm font-medium mb-6">
                <Lightbulb className="size-4" />
                Education Technology for Professors
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Streamline Your Teaching,<br />Amplify Student Success
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Sylla empowers professors with intelligent tools to organize courses, understand student needs, and deliver exceptional education all in one beautifully designed platform.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="text-base" onClick={() => navigate("/signup")}>
                  Get Started Free
                  <ChevronRight className="size-5 ml-1" />
                </Button>
                <Button size="lg" variant="outline" className="text-base" onClick={scrollToDemo}>
                  View Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1643287295715-ce7c61cfedbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjB0ZWNobm9sb2d5JTIwZGFzaGJvYXJkJTIwc2NyZWVufGVufDF8fHx8MTc3NDcyOTQwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Sylla Dashboard"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-gradient-to-br from-[#8db889] to-[#4f9ccc] rounded-full blur-3xl opacity-20 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={demoSectionRef} className="bg-[#eef5f4] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel as an Educator
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed specifically for university professors who want to enhance course structure and deepen student understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Layout className="size-6 text-[#4f9ccc]" />}
              title="Course Overview"
              description="Get a bird's-eye view of all your courses with activity snapshots, quick stats, and actionable insights at a glance."
            />
            <FeatureCard
              icon={<BookOpen className="size-6 text-[#4f9ccc]" />}
              title="Knowledge Hub"
              description="Centralize syllabi, textbooks, assignments, and course materials. Review and approve content with seamless organization."
            />
            <FeatureCard
              icon={<LineChart className="size-6 text-[#4f9ccc]" />}
              title="Student Insights"
              description="Identify student weak points, track quiz trends, and discover understanding gaps to tailor your teaching approach."
            />
            <FeatureCard
              icon={<Calendar className="size-6 text-[#4f9ccc]" />}
              title="Academic Calendar"
              description="Manage classes, deadlines, exams, and holidays with a polished, intuitive calendar designed for academic workflows."
            />
            <FeatureCard
              icon={<Layout className="size-6 text-[#4f9ccc]" />}
              title="Lesson Planner"
              description="Structure your course curriculum, organize tasks, and plan lessons with intelligent tools that save hours of prep time."
            />
            <FeatureCard
              icon={<Lightbulb className="size-6 text-[#4f9ccc]" />}
              title="Slide Enhancement"
              description="Improve lecture slides with AI-driven clarity suggestions and presentation management tools that engage students."
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1736066330610-c102cab4e942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwcHJvZmVzc29yJTIwdGVhY2hpbmclMjBjbGFzc3Jvb218ZW58MXx8fHwxNzc0NzI5NDA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Professor teaching"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission: Empowering Educators
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Sylla was built by educators, for educators. We understand the challenges of managing multiple courses, tracking student progress, and maintaining academic excellence.
              </p>
              <div className="space-y-4 mb-8">
                <MissionPoint text="Reduce administrative overhead by up to 40%" />
                <MissionPoint text="Gain deeper insights into student understanding" />
                <MissionPoint text="Improve course structure and lesson planning" />
                <MissionPoint text="Enhance teaching effectiveness with data-driven tools" />
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Join thousands of professors who are transforming their teaching workflow and creating better learning experiences for students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-[#31556b] via-[#386981] to-[#6ea98d] py-24 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Professors Choose Sylla
            </h2>
            <p className="text-xl text-[#dceef2] max-w-3xl mx-auto">
              A comprehensive platform designed to enhance every aspect of your teaching workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard
              title="Intuitive Design"
              description="No learning curve. Start organizing your courses and accessing insights from day one."
            />
            <BenefitCard
              title="Time Savings"
              description="Automate routine tasks and spend more time on what matters—teaching and mentoring students."
            />
            <BenefitCard
              title="Data-Driven"
              description="Make informed decisions with comprehensive analytics on student performance and engagement."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#f8fbfa]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join Sylla today and experience the future of academic course management.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="text-base" onClick={() => navigate("/signup")}>
              Start Free Trial
              <ChevronRight className="size-5 ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="text-base" onClick={scheduleDemo}>
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d5e3e1] py-12 bg-[#eef5f4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <BrandLogo />
            <p className="text-gray-500 text-sm">
              © 2026 Sylla. Empowering educators worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-[#d5e3e1] hover:shadow-md transition-shadow">
      <div className="size-12 rounded-lg bg-[#e4f0f7] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function MissionPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="size-6 text-[#4f9ccc] flex-shrink-0 mt-0.5" />
      <span className="text-gray-700 text-lg">{text}</span>
    </div>
  );
}

function BenefitCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center">
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-[#dceef2] text-lg leading-relaxed">{description}</p>
    </div>
  );
}
