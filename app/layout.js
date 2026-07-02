export const metadata = {
  title: "T-Shirt Delivery",
  description: "Mark t-shirt orders as delivered",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: 16 }}>
        {children}
      </body>
    </html>
  );
}
