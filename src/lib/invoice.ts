export type InvoiceItem = {
  description: string;
  qty: number;
  price: number;
};

export type InvoiceData = {
  number: string;
  date: string;
  sellerName: string;
  sellerTaxId: string;
  sellerAddress: string;
  sellerIban: string;
  sellerBank: string;
  buyerName: string;
  buyerTaxId: string;
  buyerAddress: string;
  items: InvoiceItem[];
  note: string;
};

export function calcTotal(items: InvoiceItem[]) {
  return items.reduce((sum, item) => sum + item.qty * item.price, 0);
}

export function formatUah(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(value);
}
