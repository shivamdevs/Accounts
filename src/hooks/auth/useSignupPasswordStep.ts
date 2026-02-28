import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { signUp } from "@/lib/actions";
import { ROUTES, STORAGE_KEYS } from "@/lib/constants";

type SignUpDraft = {
    name: string;
    username: string;
    email: string;
};

/**
 * Owns all state and logic for the signup password step.
 * Handles:
 *   - loading and validating the draft from sessionStorage (guard-redirects if missing)
 *   - password + confirm-password state and validation
 *   - calling signUp and routing on success/error
 */
export function useSignupPasswordStep(continueUrl: string) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [draft, setDraft] = useState<SignUpDraft | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const raw = sessionStorage.getItem(STORAGE_KEYS.signUpDraft);
        if (!raw) {
            router.replace(
                `${ROUTES.signUpCreateAccount}?continue=${
                    encodeURIComponent(continueUrl)
                }`,
            );
            return;
        }
        try {
            const parsed = JSON.parse(raw) as SignUpDraft;
            if (!parsed.name || !parsed.username || !parsed.email) {
                throw new Error("Invalid signup draft");
            }
            setDraft(parsed);
        } catch {
            sessionStorage.removeItem(STORAGE_KEYS.signUpDraft);
            router.replace(
                `${ROUTES.signUpCreateAccount}?continue=${
                    encodeURIComponent(continueUrl)
                }`,
            );
        }
    }, [continueUrl, router]);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!draft) {
            setError("Please restart sign up.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Password and confirm password must match.");
            return;
        }

        startTransition(async () => {
            const result = await signUp(
                draft.email,
                password,
                draft.username,
                draft.name,
                continueUrl,
            );
            if (!result.ok) {
                setError(result.error);
                return;
            }
            sessionStorage.setItem(STORAGE_KEYS.signInEmail, draft.email);
            sessionStorage.removeItem(STORAGE_KEYS.signUpDraft);
            router.push(result.redirectTo);
        });
    }

    return {
        draft,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        error,
        isPending,
        handleSubmit,
    };
}
