import type { ReactNode } from "react";
import Link from "next/link";

export function AuthCard({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<div className="w-full max-w-[450px] rounded-2xl border border-zinc-200/70 bg-white/95 p-8 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/90">
			<div className="mb-7 flex items-center gap-2">
				<span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgb(0_208_132/0.4)]" />
				<span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					shivamdevs.com
				</span>
			</div>
			<h1 className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
				{title}
			</h1>
			<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
				{description}
			</p>
			<div className="mt-8">{children}</div>
		</div>
	);
}

export function AuthFooter() {
	return (
		<footer className="mt-6 flex w-full max-w-[450px] items-center justify-between px-1 text-xs text-zinc-500 dark:text-zinc-400">
			<span>English (United States)</span>
			<div className="flex items-center gap-4">
				<Link href="https://shivamdevs.com" target="_blank">
					Help
				</Link>
				<Link href="https://shivamdevs.com" target="_blank">
					Privacy
				</Link>
				<Link href="https://shivamdevs.com" target="_blank">
					Terms
				</Link>
			</div>
		</footer>
	);
}
