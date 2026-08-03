export function formatBRL(value: number): string {
  return "R$ " + value.toFixed(2).replace(".", ",");
}

export function formatInstallment(price: number, times = 3): string {
  return `até ${times}x de ${formatBRL(price / times)} sem juros`;
}
