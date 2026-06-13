import { ReactNode } from "react";

interface CommandShellProps {
  children: ReactNode;
}

export default function CommandShell({ children }: CommandShellProps) {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {children}
      </div>
    </main>
  );
}
