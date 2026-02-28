import Link from "next/link";
import { AuthCard, AuthFooter } from "@/components/auth/AuthCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

const DEFAULT_TITLE = "Something went wrong";
const DEFAULT_MESSAGE =
	"We couldn't complete your request. You can try again or continue from another route.";

type ErrorSearchParams = {
	code?: string;
	title?: string;
	message?: string;
	primaryHref?: string;
	primaryLabel?: string;
	secondaryHref?: string;
	secondaryLabel?: string;
};

export default async function ErrorPage({
	searchParams,
}: {
	searchParams: Promise<ErrorSearchParams>;
}) {
	const params = await searchParams;
	const code = params.code?.trim();
	const title = params.title?.trim() || DEFAULT_TITLE;
	const message = params.message?.trim() || DEFAULT_MESSAGE;
	const primaryHref = params.primaryHref?.trim() || ROUTES.signInIdentifier;
	const primaryLabel = params.primaryLabel?.trim() || "Back to sign in";
	const secondaryHref = params.secondaryHref?.trim() || "/";
	const secondaryLabel = params.secondaryLabel?.trim() || "Go to homepage";

	return (
		<AuthPageShell>
			<AuthCard title={title} description={message}>
				<div className="space-y-6">
					{code ? (
						<p className="rounded-md border border-zinc-300/80 bg-zinc-100/80 px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
							Error code: {code}
						</p>
					) : null}
					<div className="flex flex-wrap gap-2">
						<Button asChild>
							<Link href={primaryHref}>{primaryLabel}</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href={secondaryHref}>{secondaryLabel}</Link>
						</Button>
					</div>
				</div>
			</AuthCard>
			<AuthFooter />
		</AuthPageShell>
	);
}
