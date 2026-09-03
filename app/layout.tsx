import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DownUnder Removals | Hobart & Tasmania",
  description: "Careful house removals and reliable deliveries across Tasmania. Get a free, no-obligation quote.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
