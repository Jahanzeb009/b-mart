const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export const formatCurrency = (number: number) => {
    return currencyFormatter.format(+number);
};