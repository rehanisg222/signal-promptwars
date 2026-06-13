export default function SetupRequired() {
  return (
    <div className="bg-signal-surface border border-signal-border rounded-xl p-6 space-y-6 select-none">
      {/* Dynamic Title Headers */}
      <div className="flex items-center gap-3 border-b border-signal-border pb-3">
        <span className="text-xl">🔑</span>
        <div>
          <h2 className="text-sm font-mono font-bold text-signal-amber uppercase tracking-wider">
            API_SETUP_REQUIRED // CREDENTIAL_LOCK
          </h2>
          <span className="text-[9px] font-mono text-signal-muted uppercase uppercase tracking-wider">
            Securing Generative Workspace
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-signal-text font-mono leading-relaxed">
          The server-side Google GenAI layer is currently locked because no valid <code className="text-signal-amber">GOOGLE_GEMINI_API_KEY</code> variable was discovered in your environmental workspace.
        </p>

        {/* Step-by-step documentation panel */}
        <div className="p-4 bg-signal-raised border border-signal-border rounded-lg space-y-3 font-mono text-xs">
          <h3 className="font-bold text-signal-text uppercase tracking-tight">
            How to secure and unlock SIGNAL:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-signal-muted">
            <li>
              Acquire a secure API key from the{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-blue font-bold hover:underline cursor-pointer"
              >
                Google AI Studio Key Console ↗
              </a>
            </li>
            <li>
              Locate the project environment file <code className="text-signal-text">.env</code> in your root workspace.
            </li>
            <li>
              Inject your acquired token straight into the config:
              <pre className="mt-1.5 p-2 bg-black/40 rounded border border-signal-border/80 text-signal-teal text-[10px] select-all overflow-x-auto">
                GOOGLE_GEMINI_API_KEY="your_api_key_here"
              </pre>
            </li>
            <li>
              Restart your CLI development stack if modifications are not picked up instantly.
            </li>
          </ol>
        </div>

        <p className="text-[10px] font-mono text-signal-muted leading-relaxed">
          * Note: Securing API secrets server-side protects credentials from browser inspect leaks or key hijacking. Never commit your secrets onto git repositories.
        </p>
      </div>
    </div>
  );
}
