import { redirect } from "next/navigation";
import { AuthCard, AuthFooter } from "@/components/auth/AuthCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { IdentifierForm } from "@/components/auth/IdentifierForm";
import { DEFAULT_CONTINUE } from "@/lib/constants";
import { hasValidSession } from "@/lib/session";
import { normalizeContinueUrl } from "@/lib/redirect";

export default async function IdentifierPage({
	searchParams,
}: {
	searchParams: Promise<{
		continue?: string;
		status?: string;
		identifier?: string;
	}>;
}) {
	const params = await searchParams;
	const continueUrl = params.continue ?? DEFAULT_CONTINUE;
	const initialEmail = params.identifier ?? "";

	if (await hasValidSession()) {
		return redirect(normalizeContinueUrl(continueUrl));
	}

	return (
		<AuthPageShell>
			<AuthCard
				title="Sign in"
				description="to continue to shivamdevs apps"
			>
				<IdentifierForm
					initialEmail={initialEmail}
					continueUrl={continueUrl}
					status={params.status}
				/>
			</AuthCard>
			<AuthFooter />
		</AuthPageShell>
	);
}
