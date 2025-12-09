import { NhostProvider } from '@/components/Providers/NhostProvider';
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kolektt.AI - Card News Generator",
  description: "Create viral card news with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <NhostProvider>
          {children}
        </NhostProvider>
      </body>
    </html>
  );
}
