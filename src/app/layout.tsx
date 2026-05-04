import type { Metadata } from "next";
import { Almarai, Instrument_Serif } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const almarai = Almarai({
  variable: "--font-almarai",
  weight: ["300", "400", "700", "800"],
  subsets: ["arabic"], // Almarai only supports arabic/latin via specific subsets depending on google fonts, usually standard is fine but Google Fonts says Almarai supports arabic. I will omit subsets or put arabic. Let's just use arabic.
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sahayak AI | The Educational Revolution",
  description: "Your AI Teaching Partner for Multi-Grade Classrooms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${almarai.variable} ${instrumentSerif.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
