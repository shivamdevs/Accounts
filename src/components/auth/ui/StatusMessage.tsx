import { cn } from "@/lib/utils";

type Variant = "info" | "error";

/**
 * Renders a tinted status/error message box.
 * Returns null when message is empty so callers don't need a conditional.
 */
export function StatusMessage({
	message,
	variant = "info",
	className,
}: {
	message: string;
	variant?: Variant;
	className?: string;
}) {
	if (!message) return null;

	return (
		<p
			className={cn(
				"rounded-md border px-3 py-2 text-sm",
				variant === "error"
					? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
					: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
				className,
			)}
		>
			{message}
		</p>
	);
}
