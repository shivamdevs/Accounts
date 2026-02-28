import { useState } from "react";
import { useRouter } from "next/navigation";

import { ROUTES, STORAGE_KEYS } from "@/lib/constants";

const USERNAME_PATTERN = /^[a-z0-9_.]{3,64}$/;

type SignupFields = {
    name: string;
    username: string;
    email: string;
};

/**
 * Owns all state and logic for the signup identity step (name / username / email).
 * Handles:
 *   - form field state
 *   - client-side validation
 *   - persisting the draft to sessionStorage and routing to the password step
 */
export function useSignupStep(continueUrl: string) {
    const router = useRouter();

    const [form, setForm] = useState<SignupFields>({
        name: "",
        username: "",
        email: "",
    });
    const [error, setError] = useState("");

    function setField<K extends keyof SignupFields>(key: K, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!USERNAME_PATTERN.test(form.username)) {
            setError(
                "Username must be 3-64 chars and contain only a-z, 0-9, _, .",
            );
            return;
        }

        sessionStorage.setItem(
            STORAGE_KEYS.signUpDraft,
            JSON.stringify({
                name: form.name.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
            }),
        );
        router.push(
            `${ROUTES.signUpCreatePassword}?continue=${
                encodeURIComponent(continueUrl)
            }`,
        );
    }

    return { form, setField, error, handleSubmit };
}
