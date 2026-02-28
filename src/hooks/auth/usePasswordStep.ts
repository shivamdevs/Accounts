import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { signIn } from "@/lib/actions";
import { ROUTES, STORAGE_KEYS } from "@/lib/constants";

/**
 * Owns all state and logic for the password challenge step.
 * Handles:
 *   - reading the identifier from sessionStorage (guard-redirects if missing)
 *   - password input state
 *   - calling signIn and routing on success/error
 */
export function usePasswordStep(continueUrl: string) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [email] = useState(() => {
        if (typeof window === "undefined") return "";
        return sessionStorage.getItem(STORAGE_KEYS.signInEmail) ?? "";
    });
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const stored = sessionStorage.getItem(STORAGE_KEYS.signInEmail) ?? "";
        if (!stored) {
            router.replace(
                `${ROUTES.signInIdentifier}?continue=${
                    encodeURIComponent(continueUrl)
                }`,
            );
        }
    }, [continueUrl, router]);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        startTransition(async () => {
            const result = await signIn(email, password, continueUrl);
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
            router.push(result.redirectTo);
        });
    }

    return { email, password, setPassword, error, isPending, handleSubmit };
}
