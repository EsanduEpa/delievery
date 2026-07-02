import "./globals.css";

export const metadata = {
  title: "T-Shirt Delivery",
  description: "Mark t-shirt orders as delivered",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
