export function formatPercentage(decimalValue, decimals = 1) {
    if (decimalValue === null || decimalValue === undefined || isNaN(decimalValue)) return "—";
    const percent = decimalValue > 1 ? decimalValue : decimalValue * 100;
    return `${percent.toFixed(decimals)}%`;
}

export function formatMetric(value, unit = "") {
    if (value === null || value === undefined || isNaN(value)) return "—";
    return unit ? `${value} ${unit}` : `${value}`;
}
