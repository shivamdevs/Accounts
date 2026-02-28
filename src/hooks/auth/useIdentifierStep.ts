import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { requestOtp } from "@/lib/actions";
import { ROUTES, STORAGE_KEYS } from "@/lib/constants";

function looksLikeEmail(value: string): boolean {
    return value.includes("@");
}

/**
 * Owns all state and logic for the identifier (email / username) step.
 * Handles:
 *   - identifier input state (seeded from sessionStorage)
 *   - routing to the password challenge on "Next"
 *   - OTP request + routing to the OTP challenge on "Email me a code"
 */
export function useIdentifierStep(initialEmail: string, continueUrl: string) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [identifier, setIdentifierRaw] = useState(() => {
        if (initialEmail) return initialEmail;
        if (typeof window === "undefined") return "";
        return sessionStorage.getItem(STORAGE_KEYS.signInEmail) ?? "";
    });
    const [otpError, setOtpError] = useState("");

    const canUseOtp = looksLikeEmail(identifier.trim());

    function setIdentifier(value: string) {
        setOtpError("");
        setIdentifierRaw(value);
    }

    function handleNext(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const value = identifier.trim();
        if (!value) return;
        sessionStorage.setItem(STORAGE_KEYS.signInEmail, value);
        const query = new URLSearchParams({ continue: continueUrl });
        router.push(`${ROUTES.signInPassword}?${query.toString()}`);
    }

    function handleOtp() {
        const value = identifier.trim();
        if (!value || !looksLikeEmail(value)) return;
        setOtpError("");

        startTransition(async () => {
            const result = await requestOtp(value);
            if (!result.ok) {
                setOtpError(result.error);
                return;
            }
            sessionStorage.setItem(STORAGE_KEYS.signInEmail, value);
            sessionStorage.setItem(STORAGE_KEYS.otpId, result.otpId);
            sessionStorage.setItem(STORAGE_KEYS.otpEmail, value);
            const query = new URLSearchParams({ continue: continueUrl });
            router.push(`${ROUTES.signInOtp}?${query.toString()}`);
        });
    }

    return {
        identifier,
        setIdentifier,
        otpError,
        canUseOtp,
        isPending,
        handleNext,
        handleOtp,
    };
}

/** Maps the ?status= query param to a human-readable message. */
export function useIdentifierStatus(status: string | undefined): string {
    return useMemo(() => {
        if (status === "verify-sent") {
            return "Verification email sent. Confirm your inbox, then continue sign in.";
        }
        if (status === "verify-required") {
            return "Your account is not verified yet. Please verify your email first.";
        }
        return "";
    }, [status]);
}
