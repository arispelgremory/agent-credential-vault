interface DecimalThousandSeparatorProps {
    value: number;
    className?: string;
}

export function DecimalThousandSeparator({ value, className = "" }: DecimalThousandSeparatorProps) {
    const formattedValue = new Intl.NumberFormat("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

    return <span className={className}>{formattedValue}</span>;
}
