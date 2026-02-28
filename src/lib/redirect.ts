import { DEFAULT_REDIRECT_URL } from "@/lib/constants";

export function normalizeContinueUrl(raw: string | null | undefined): string {
    if (!raw) return DEFAULT_REDIRECT_URL;
    if (raw.startsWith("/")) return raw;

    try {
        const withScheme =
            raw.startsWith("http://") || raw.startsWith("https://")
                ? raw
                : raw.startsWith("localhost") || raw.startsWith("127.0.0.1")
                ? `http://${raw}`
                : `https://${raw}`;
        const url = new URL(withScheme);
        const isLocal = url.hostname === "localhost" ||
            url.hostname === "127.0.0.1";
        const isShivamDomain = url.hostname === "shivamdevs.com" ||
            url.hostname.endsWith(".shivamdevs.com");

        if (!isLocal && !isShivamDomain) return DEFAULT_REDIRECT_URL;
        return url.toString();
    } catch {
        return DEFAULT_REDIRECT_URL;
    }
}
