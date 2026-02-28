"use client";

import {
	useIdentifierStep,
	useIdentifierStatus,
} from "@/hooks/auth/useIdentifierStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLink } from "@/components/auth/ui/AuthLink";
import { StatusMessage } from "@/components/auth/ui/StatusMessage";
import { ROUTES } from "@/lib/constants";
import OauthProviders from "./OauthProviders";

export function IdentifierForm({
	initialEmail,
	continueUrl,
	status,
}: {
	initialEmail: string;
	continueUrl: string;
	status?: string;
}) {
	const {
		identifier,
		setIdentifier,
		otpError,
		canUseOtp,
		isPending,
		handleNext,
		handleOtp,
	} = useIdentifierStep(initialEmail, continueUrl);
	const statusText = useIdentifierStatus(status);

	return (
		<form onSubmit={handleNext} className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="identifier">Email or username</Label>
				<Input
					id="identifier"
					type="text"
					autoComplete="username"
					required
					value={identifier}
					onChange={(e) => setIdentifier(e.target.value)}
					className="h-11"
				/>
			</div>

			<StatusMessage message={statusText} />
			<StatusMessage message={otpError} variant="error" />

			<div className="flex items-center justify-between gap-3">
				<AuthLink
					href={`${ROUTES.signUpCreateAccount}?continue=${encodeURIComponent(continueUrl)}`}
				>
					Create account
				</AuthLink>
				<div className="flex items-center gap-2">
					{canUseOtp && (
						<Button
							type="button"
							variant="outline"
							className="h-10 px-4"
							onClick={handleOtp}
							disabled={isPending}
						>
							{isPending ? "Sending..." : "Email me a code"}
						</Button>
					)}
					<Button type="submit" className="h-10 px-5">
						Next
					</Button>
				</div>
			</div>

			<OauthProviders continueUrl={continueUrl} />
		</form>
	);
}
