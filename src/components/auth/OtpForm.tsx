"use client";

import { useOtpStep } from "@/hooks/auth/useOtpStep";
import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { AuthLink } from "@/components/auth/ui/AuthLink";
import { IdentifierBadge } from "@/components/auth/ui/IdentifierBadge";
import { StatusMessage } from "@/components/auth/ui/StatusMessage";
import { ROUTES } from "@/lib/constants";

export function OtpForm({ continueUrl }: { continueUrl: string }) {
	const {
		email,
		otp,
		setOtp,
		error,
		resent,
		isPending,
		isResending,
		handleSubmit,
		handleResend,
	} = useOtpStep(continueUrl);

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<IdentifierBadge value={email} />

			<div className="space-y-3">
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Enter the 6-digit code sent to your email. It expires in 3
					minutes.
				</p>
				<InputOTP
					maxLength={6}
					value={otp}
					onChange={setOtp}
					disabled={isPending}
					autoFocus
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>
			</div>

			<StatusMessage message={error} variant="error" />
			<StatusMessage message={resent ? "A new code was sent." : ""} />

			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<AuthLink
						href={`${ROUTES.signInIdentifier}?continue=${encodeURIComponent(continueUrl)}`}
					>
						Back
					</AuthLink>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleResend}
						disabled={isResending || !email}
						className="h-auto p-0 text-zinc-500 hover:bg-transparent hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						{isResending ? "Sending..." : "Resend code"}
					</Button>
				</div>
				<Button
					type="submit"
					className="h-10 px-5"
					disabled={isPending || otp.length !== 6}
				>
					{isPending ? "Verifying..." : "Verify"}
				</Button>
			</div>
		</form>
	);
}
