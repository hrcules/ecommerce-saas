export function calculateShipping(
  subtotalInCents: number,
  fixedShippingFeeInCents: number,
  freeShippingThresholdInCents: number | null,
) {
  let freightInCents = fixedShippingFeeInCents;

  if (
    freeShippingThresholdInCents !== null &&
    subtotalInCents >= freeShippingThresholdInCents
  ) {
    freightInCents = 0;
  }

  return freightInCents;
}
