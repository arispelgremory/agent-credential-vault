interface FormattedStringProps {
    name: string;
    className?: string;
}

export function FormattedString({ name, className }: FormattedStringProps) {
    if (!name) return <span className={className}>-</span>;

    const formattedName = String(name)
        .split(/[_\s-]/) // Split on underscore, space, or hyphen
        .filter(Boolean) // Remove empty strings
        .map((word) => {
            // Split on capital letters for camelCase
            const parts = String(word)
                .split(/(?=[A-Z])/)
                .filter(Boolean);
            return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
        })
        .join(" ");

    return <span className={className}>{formattedName}</span>;
}
