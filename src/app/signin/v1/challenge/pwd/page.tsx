import { redirect } from "next/navigation";
import { AuthCard, AuthFooter } from "@/components/auth/AuthCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { PasswordForm } from "@/components/auth/PasswordForm";
import { DEFAULT_CONTINUE } from "@/lib/constants";
import { hasValidSession } from "@/lib/session";
import { normalizeContinueUrl } from "@/lib/redirect";

export default async function PasswordPage({
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
				title="Welcome"
				description="Confirm your password to continue"
			>
				<PasswordForm continueUrl={continueUrl} />
			</AuthCard>
			<AuthFooter />
		</AuthPageShell>
	);
}
