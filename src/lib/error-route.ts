import { ROUTES } from "@/lib/constants";

export type ErrorRouteInput = {
    code: string;
    title: string;
    message: string;
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
};

export function buildErrorRoute(input: ErrorRouteInput): string {
    const params = new URLSearchParams({
        code: input.code,
        title: input.title,
        message: input.message,
    });

    if (input.primaryHref) params.set("primaryHref", input.primaryHref);
    if (input.primaryLabel) params.set("primaryLabel", input.primaryLabel);
    if (input.secondaryHref) params.set("secondaryHref", input.secondaryHref);
    if (input.secondaryLabel) {
        params.set("secondaryLabel", input.secondaryLabel);
    }

    return `${ROUTES.error}?${params.toString()}`;
}
