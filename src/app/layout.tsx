import "./globals.css";
import { Rajdhani, Orbitron } from "next/font/google";

const raj = Rajdhani({ subsets: ["latin", "cyrillic"], weight: ["400","500","600","700"], variable: "--font-raj" });
const orb = Orbitron({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-orb" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${raj.variable} ${orb.variable} bg-hud text-hudText`}>{children}</body>
    </html>
  );
}