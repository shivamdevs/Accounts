import type { ReactNode } from "react";

/**
 * Full-page wrapper with the themed radial-gradient background used on every
 * auth page. Centralise here so a single edit changes the look everywhere.
 */
export function AuthPageShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(17,24,39,0.06),transparent_45%),linear-gradient(to_bottom,#f8fafc,#eef2ff)] px-4 dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_40%),linear-gradient(to_bottom,#03050a,#05070f)]">
			{children}
		</div>
	);
}
