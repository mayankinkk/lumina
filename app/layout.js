import { Literata, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreHydrator } from "@/components/store-hydrator";
import { ServiceWorkerRegistration } from "@/components/sw-registration";
import { ToastProvider } from "@/components/toast";
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
  description: "An AI-powered reading application for deep focus and learning",
  manifest: "/manifest.json",
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
              <ServiceWorkerRegistration />
              {children}
            </ToastProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
