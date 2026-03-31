import "./globals.css";

export const metadata = {
  title: "BenchBot — BenchDepot Product Assistant",
  description: "AI-powered product assistant for BenchDepot industrial workbenches.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: "var(--color-bench-950)" }}>
        {children}
      </body>
    </html>
  );
}
