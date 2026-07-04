"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, BookMarked, BarChart3, Upload, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = [
  {
    icon: BookOpen,
    title: "Welcome to Lumina",
    desc: "A beautiful reading app with vocabulary building, highlights, and AI-powered insights.",
  },
  {
    icon: Upload,
    title: "Add Your Books",
    desc: "Upload PDFs, EPUBs, comics (CBZ), or text files. They're stored locally in your browser.",
  },
  {
    icon: BookMarked,
    title: "Build Vocabulary",
    desc: "Select any word while reading to look it up. Save words for spaced repetition review.",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    desc: "Monitor your reading streaks, time spent, and daily goals with detailed analytics.",
  },
];

export function OnboardingFlow() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const seen = localStorage.getItem("lumina_onboarding_done");
    if (!seen) setOpen(true);
  }, []);

  const handleDone = () => {
    localStorage.setItem("lumina_onboarding_done", "true");
    setOpen(false);
    router.push("/library");
  };

  if (!open) return null;

  const { icon: Icon, title, desc } = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm text-center p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">{desc}</p>
          </div>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"}`} />
            ))}
          </div>
          <div className="flex gap-2 w-full">
            {step > 0 && (
              <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button className="flex-1" onClick={isLast ? handleDone : () => setStep(step + 1)}>
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
          {isLast && (
            <button onClick={handleDone} className="text-xs text-muted-foreground hover:underline">
              Skip for now
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
