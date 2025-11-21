export const numberToCurrency = (number: number): string => {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
    }).format(number);
};
