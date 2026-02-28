import Link from "next/link";
import { OAUTH_PROVIDERS, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export interface OauthProviderProps {
	continueUrl: string;
}

export default function OauthProviders({ continueUrl }: OauthProviderProps) {
	return (
		<div className="space-y-2 border-t border-zinc-200/70 pt-4 dark:border-zinc-800/80">
			{OAUTH_PROVIDERS.map((provider) => {
				const Icon = provider.icon;
				return (
					<Button
						key={provider.id}
						variant="outline"
						className="w-full h-11"
						asChild
					>
						<Link
							key={provider.id}
							href={`${ROUTES.oauthStart}/${provider.id}/start?continue=${encodeURIComponent(continueUrl)}`}
							// className="flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-transparent text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
						>
							<Icon className="mr-2 h-4 w-4" />
							Continue with {provider.name}
						</Link>
					</Button>
				);
			})}
		</div>
	);
}
