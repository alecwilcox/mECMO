import "./globals.css";

export const metadata = {
  title: 'mECMO EMS Info',
  description: 'Data entry and export tool for EMS mECMO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
