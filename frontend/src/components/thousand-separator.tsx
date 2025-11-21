interface ThousandSeparatorProps {
    value: number;
    className?: string;
}

export function ThousandSeparator({ value, className = "" }: ThousandSeparatorProps) {
    const formattedValue = new Intl.NumberFormat("en-MY", {
        maximumFractionDigits: 2,
    }).format(value);

    return <span className={className}>{formattedValue}</span>;
}
