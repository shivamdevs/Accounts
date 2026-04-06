import { GitHubIcon, GoogleIcon } from "@/components/icons/Branding";

const env = process.env;
export const IS_PROD = env.NODE_ENV === "production";

export const PB_URL = env.NEXT_PUBLIC_PB_URL ?? "http://localhost:8090";

export const COOKIE_NAME = "pb_auth";
export const COOKIE_DOMAIN = env.COOKIE_DOMAIN ?? ".shivamdevs.com";
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const COOKIE_SAME_SITE = "strict" as const;
export const OAUTH_CTX_COOKIE_SAME_SITE = "lax" as const;

export const OAUTH_CTX_COOKIE_NAME = "pb_oauth_ctx";

export const DEFAULT_CONTINUE = env.DEFAULT_CONTINUE_URL ??
	(IS_PROD ? "https://shivamdevs.com" : "http://localhost:4011");
export const DEFAULT_REDIRECT_URL = env.AUTH_DEFAULT_REDIRECT_URL ??
	DEFAULT_CONTINUE;
export const PROFILE_ONBOARDING_URL = env.PROFILE_ONBOARDING_URL ??
	(IS_PROD
		? "https://profile.shivamdevs.com/onboarding"
		: "http://localhost:4012/onboarding");

export type OAuthProvider = "google" | "github";

export function isOAuthProvider(value: string): value is OAuthProvider {
	return value === "google" || value === "github";
}

export const OAUTH_REDIRECT_BASE_URL = env.OAUTH_REDIRECT_BASE_URL ??
	(IS_PROD ? "https://accounts.shivamdevs.com" : "http://localhost:4010");

export const APP_BASE_URL = env.APP_BASE_URL ?? OAUTH_REDIRECT_BASE_URL;

export function buildAppUrl(path: string): URL {
	return new URL(path, APP_BASE_URL);
}

export function buildOAuthRedirectUri(provider: OAuthProvider): string {
	return `${OAUTH_REDIRECT_BASE_URL}/oauth/${provider}/callback`;
}

export const ROUTES = {
	auth: "/auth",
	error: "/error",
	signInIdentifier: "/signin/v1/identifier",
	signInPassword: "/signin/v1/challenge/pwd",
	signInOtp: "/signin/v1/challenge/otp",
	signUpCreateAccount: "/signup/v1/createaccount",
	signUpCreatePassword: "/signup/v1/createpassword",
	oauthStart: "/oauth",
	oauthCallback: "/oauth/[provider]/callback",
	impersonate: "/impersonate",
	logout: "/logout",
	onboardingComplete: "/onboarding/complete",
} as const;

export const STORAGE_KEYS = {
	signInEmail: "accounts.signin.email",
	signUpDraft: "accounts.signup.draft",
	otpId: "accounts.signin.otp_id",
	otpEmail: "accounts.signin.otp_email",
} as const;

export const OAUTH_PROVIDERS = [
	{
		id: "google",
		name: "Google",
		icon: GoogleIcon,
	},
	{
		id: "github",
		name: "GitHub",
		icon: GitHubIcon,
	},
] as const;

export const AVATAR_BASE_URL = "https://avatars.shivamdevs.com/u";

export function getDefaultAvatarUrl(userId: string, username: string): string {
	return `${AVATAR_BASE_URL}/${encodeURIComponent(userId)}/${
		encodeURIComponent(username)
	}`;
}

export function buildProfileOnboardingUrl(continueUrl: string): string {
	return `${PROFILE_ONBOARDING_URL}?continue=${
		encodeURIComponent(continueUrl)
	}`;
}
