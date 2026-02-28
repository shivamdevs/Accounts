"use client";

import { usePasswordStep } from "@/hooks/auth/usePasswordStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLink } from "@/components/auth/ui/AuthLink";
import { IdentifierBadge } from "@/components/auth/ui/IdentifierBadge";
import { StatusMessage } from "@/components/auth/ui/StatusMessage";
import { ROUTES } from "@/lib/constants";

export function PasswordForm({ continueUrl }: { continueUrl: string }) {
	const { email, password, setPassword, error, isPending, handleSubmit } =
		usePasswordStep(continueUrl);

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<IdentifierBadge value={email} />

			<div className="space-y-2">
				<Label htmlFor="password">Enter your password</Label>
				<Input
					id="password"
					type="password"
					autoComplete="current-password"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="h-11"
				/>
			</div>

			<StatusMessage message={error} variant="error" />

			<div className="flex items-center justify-between gap-3">
				<AuthLink
					href={`${ROUTES.signInIdentifier}?continue=${encodeURIComponent(continueUrl)}`}
				>
					Back
				</AuthLink>
				<Button
					type="submit"
					className="h-10 px-5"
					disabled={isPending || !email}
				>
					{isPending ? "Signing in..." : "Next"}
				</Button>
			</div>
		</form>
	);
}
