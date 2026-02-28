import { redirect } from "next/navigation";
import { AuthCard, AuthFooter } from "@/components/auth/AuthCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SignupPasswordForm } from "@/components/auth/SignupPasswordForm";
import { DEFAULT_CONTINUE } from "@/lib/constants";
import { hasValidSession } from "@/lib/session";
import { normalizeContinueUrl } from "@/lib/redirect";

export default async function CreatePasswordPage({
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
				title="Create a strong password"
				description="Use at least 8 characters"
			>
				<SignupPasswordForm continueUrl={continueUrl} />
			</AuthCard>
			<AuthFooter />
		</AuthPageShell>
	);
}
