"use client";

import { useSignupStep } from "@/hooks/auth/useSignupStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLink } from "@/components/auth/ui/AuthLink";
import { StatusMessage } from "@/components/auth/ui/StatusMessage";
import { ROUTES } from "@/lib/constants";

export function SignupForm({ continueUrl }: { continueUrl: string }) {
	const { form, setField, error, handleSubmit } = useSignupStep(continueUrl);

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					required
					value={form.name}
					onChange={(e) => setField("name", e.target.value)}
					className="h-11"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="username">Username</Label>
				<Input
					id="username"
					required
					minLength={3}
					maxLength={64}
					pattern="^[a-z0-9_.]+$"
					value={form.username}
					onChange={(e) =>
						setField("username", e.target.value.toLowerCase())
					}
					className="h-11"
				/>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">
					a-z, 0-9, underscore, dot
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					autoComplete="email"
					required
					value={form.email}
					onChange={(e) => setField("email", e.target.value)}
					className="h-11"
				/>
			</div>

			<StatusMessage message={error} variant="error" />

			<div className="mt-2 flex items-center justify-between gap-3">
				<AuthLink
					href={`${ROUTES.signInIdentifier}?continue=${encodeURIComponent(continueUrl)}`}
				>
					Sign in instead
				</AuthLink>
				<Button type="submit" className="h-10 px-5">
					Next
				</Button>
			</div>
		</form>
	);
}
