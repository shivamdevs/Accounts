import { redirect } from "next/navigation";
import { DEFAULT_CONTINUE, ROUTES } from "@/lib/constants";
import { hasValidSession } from "@/lib/session";
import { normalizeContinueUrl } from "@/lib/redirect";

export default async function AuthEntry({
	searchParams,
}: {
	searchParams: Promise<{ continue?: string }>;
}) {
	const params = await searchParams;
	const continueUrl = params.continue ?? DEFAULT_CONTINUE;
	if (await hasValidSession()) {
		redirect(normalizeContinueUrl(continueUrl));
	}
	redirect(
		`${ROUTES.signInIdentifier}?continue=${encodeURIComponent(continueUrl)}`,
	);
}
