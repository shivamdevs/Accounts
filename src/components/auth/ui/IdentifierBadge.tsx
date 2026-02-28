/**
 * Renders the identifier pill shown above challenge forms (password / OTP / signup-password).
 * Returns null when value is empty.
 */
export function IdentifierBadge({ value }: { value: string }) {
	if (!value) return null;

	return (
		<p className="rounded-full border border-zinc-300/80 px-4 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
			{value}
		</p>
	);
}
