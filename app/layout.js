import { Literata, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreHydrator } from "@/components/store-hydrator";
import { ToastProvider } from "@/components/toast";
import { AppLockProvider } from "@/components/layout/app-lock";
import { ReadingInsights } from "@/components/layout/reading-insights";
import { OnboardingFlow } from "@/components/layout/onboarding-flow";
import "./globals.css";

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Lumina - AI Reading Companion",
  description: "An AI-powered reading application for deep focus and learning with PDF reader, vocabulary builder, and smart highlights.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Lumina - AI Reading Companion",
    description: "An AI-powered reading application for deep focus and learning",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina - AI Reading Companion",
    description: "An AI-powered reading application for deep focus and learning",
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: "#182442",
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${literata.variable} ${jakarta.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ("serviceWorker" in navigator) { window.addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => {}); }); }`,
          }}
        />
      </head>
      <body className="min-h-full bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ToastProvider>
              <StoreHydrator />
              <ReadingInsights />
              <OnboardingFlow />
              <AppLockProvider>
                {children}
              </AppLockProvider>
            </ToastProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
