import { redirect } from "next/navigation";
import { AuthCard, AuthFooter } from "@/components/auth/AuthCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { DEFAULT_CONTINUE } from "@/lib/constants";
import { hasValidSession } from "@/lib/session";
import { normalizeContinueUrl } from "@/lib/redirect";

export default async function CreateAccountPage({
	searchParams,
}: {
	searchParams: Promise<{ continue?: string }>;
}) {
	const params = await searchParams;
	const continueUrl = params.continue ?? DEFAULT_CONTINUE;

	if (await hasValidSession()) {
		return redirect(normalizeContinueUrl(continueUrl));
	}

	return (
		<AuthPageShell>
			<AuthCard
				title="Create your account"
				description="Use one account across all shivamdevs apps"
			>
				<SignupForm continueUrl={continueUrl} />
			</AuthCard>
			<AuthFooter />
		</AuthPageShell>
	);
}
