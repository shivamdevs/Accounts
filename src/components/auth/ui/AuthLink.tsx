import type { ComponentProps } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Styled navigation link used inside auth forms.
 * Accepts all props that Next.js <Link> accepts.
 */
export function AuthLink({ className, ...props }: ComponentProps<typeof Link>) {
	return (
		<Link
			className={cn(
				"text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300",
				className,
			)}
			{...props}
		/>
	);
}
