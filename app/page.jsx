import ChatWindow from "./components/ChatWindow";

export default function Home() {
  return (
    <div className="h-dvh flex flex-col" style={{ background: "var(--color-bench-950)" }}>
      <header
        className="shrink-0 flex items-center justify-between px-5 py-3"
        style={{
          background: "var(--color-bench-900)",
          borderBottom: "1px solid var(--color-bench-800)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
            style={{
              background: "linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600))",
              fontFamily: "var(--font-display)",
            }}
          >
            B
          </div>
          <div>
            <h1
              className="text-sm font-semibold leading-tight"
              style={{ color: "var(--color-bench-100)", fontFamily: "var(--font-display)" }}
            >
              BenchBot
            </h1>
            <p className="text-xs" style={{ color: "var(--color-bench-500)" }}>
              BenchDepot product assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{ background: "rgba(29, 158, 117, 0.15)", color: "#5dcaa5" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#5dcaa5" }} />
            Online
          </span>
        </div>
      </header>
      <main className="flex-1 min-h-0">
        <ChatWindow />
      </main>
    </div>
  );
}
