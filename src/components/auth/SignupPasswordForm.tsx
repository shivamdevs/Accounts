"use client";

import { useSignupPasswordStep } from "@/hooks/auth/useSignupPasswordStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLink } from "@/components/auth/ui/AuthLink";
import { IdentifierBadge } from "@/components/auth/ui/IdentifierBadge";
import { StatusMessage } from "@/components/auth/ui/StatusMessage";
import { ROUTES } from "@/lib/constants";

export function SignupPasswordForm({ continueUrl }: { continueUrl: string }) {
	const {
		draft,
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		error,
		isPending,
		handleSubmit,
	} = useSignupPasswordStep(continueUrl);

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<IdentifierBadge value={draft?.email ?? ""} />

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					autoComplete="new-password"
					required
					minLength={8}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="h-11"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm password</Label>
				<Input
					id="confirmPassword"
					type="password"
					autoComplete="new-password"
					required
					minLength={8}
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					className="h-11"
				/>
			</div>

			<StatusMessage message={error} variant="error" />

			<div className="flex items-center justify-between gap-3">
				<AuthLink
					href={`${ROUTES.signUpCreateAccount}?continue=${encodeURIComponent(continueUrl)}`}
				>
					Back
				</AuthLink>
				<Button
					type="submit"
					className="h-10 px-5"
					disabled={isPending}
				>
					{isPending ? "Creating..." : "Create account"}
				</Button>
			</div>
		</form>
	);
}
