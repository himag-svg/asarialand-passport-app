import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Republic of Asarialand — Passport Services",
  description:
    "Official passport renewal and issuance portal for the Republic of Asarialand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans antialiased">
        <SupabaseProvider>
          <QueryProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#181d27",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#e2e8f0",
                  borderRadius: "12px",
                },
              }}
            />
          </QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
