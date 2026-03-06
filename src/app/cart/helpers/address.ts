export const formatAddress = (addressItem: {
  fullName: string;
  address: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}) => {
  return `${addressItem.fullName} • ${addressItem.address}, ${addressItem.number}
    ${addressItem.complement ? `, ${addressItem.complement}` : ""}, ${addressItem.neighborhood}
    , ${addressItem.city} - ${addressItem.state} • CEP: ${addressItem.zipCode}`;
};
