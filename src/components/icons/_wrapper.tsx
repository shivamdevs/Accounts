import type { CSSProperties, AriaRole } from "react";

export interface IconProps {
	size?: CSSProperties["width"];
	color?: CSSProperties["color"];
	className?: string;
}

export interface IconWrapperPathProps {
	d: string;
	fillRule?: "nonzero" | "evenodd" | "inherit";
	clipRule?: "nonzero" | "evenodd" | "inherit";
}

export interface IconWrapperProps extends IconProps {
	viewBox: string;
	role?: AriaRole;
	title: string;
	paths: readonly IconWrapperPathProps[];
}

export default function IconWrapper({
	viewBox,
	role = "img",
	title,
	paths,
	size,
	color,
	className,
}: IconWrapperProps) {
	return (
		<svg
			viewBox={viewBox}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role={role}
			aria-label={title}
			width={size}
			height={size}
			className={className}
			{...(color && { style: { color } })}
		>
			<title>{title}</title>
			{paths.map((path, index) => (
				<path
					key={index}
					d={path.d}
					fillRule={path.fillRule}
					clipRule={path.clipRule}
					fill="currentColor"
				/>
			))}
		</svg>
	);
}
