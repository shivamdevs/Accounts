import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const bricolage = Bricolage_Grotesque({
	variable: "--font-display",
	subsets: ["latin"],
	axes: ["opsz", "wdth"],
});

export const metadata: Metadata = {
	title: "Accounts • ShivamDevs",
	description: "Identity hub for the shivamdevs.com ecosystem",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${publicSans.variable} ${bricolage.variable}`}
		>
			<body className="font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
