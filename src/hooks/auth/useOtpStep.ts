import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { requestOtp, verifyOtp } from "@/lib/actions";
import { ROUTES, STORAGE_KEYS } from "@/lib/constants";

/**
 * Owns all state and logic for the OTP challenge step.
 * Handles:
 *   - reading email + otpId from sessionStorage (guard-redirects if missing)
 *   - OTP input state
 *   - verifying the code and routing on success/error
 *   - resending the OTP
 */
export function useOtpStep(continueUrl: string) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isResending, startResend] = useTransition();

    const [email] = useState(() => {
        if (typeof window === "undefined") return "";
        return sessionStorage.getItem(STORAGE_KEYS.otpEmail) ?? "";
    });
    const [otpId, setOtpId] = useState(() => {
        if (typeof window === "undefined") return "";
        return sessionStorage.getItem(STORAGE_KEYS.otpId) ?? "";
    });
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [resent, setResent] = useState(false);

    useEffect(() => {
        if (!email || !otpId) {
            router.replace(
                `${ROUTES.signInIdentifier}?continue=${
                    encodeURIComponent(continueUrl)
                }`,
            );
        }
    }, [continueUrl, email, otpId, router]);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (otp.length !== 6) return;
        setError("");

        startTransition(async () => {
            const result = await verifyOtp(otpId, otp, continueUrl);
            if (!result.ok) {
                if (result.code === "EMAIL_NOT_VERIFIED") {
                    router.push(
                        `${ROUTES.signInIdentifier}?status=verify-required&continue=${
                            encodeURIComponent(continueUrl)
                        }`,
                    );
                    return;
                }
                setError(result.error);
                return;
            }
            sessionStorage.removeItem(STORAGE_KEYS.otpId);
            sessionStorage.removeItem(STORAGE_KEYS.otpEmail);
            router.push(result.redirectTo);
        });
    }

    function handleResend() {
        if (!email) return;
        setResent(false);

        startResend(async () => {
            const result = await requestOtp(email);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            sessionStorage.setItem(STORAGE_KEYS.otpId, result.otpId);
            setOtpId(result.otpId);
            setOtp("");
            setError("");
            setResent(true);
        });
    }

    return {
        email,
        otp,
        setOtp,
        error,
        resent,
        isPending,
        isResending,
        handleSubmit,
        handleResend,
    };
}
