import { OfferLineItem, VatMode } from '../types';

export const round2 = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const calculateLineItem = (
  quantity: number,
  unitPrice: number,
  vatMode: VatMode,
  vatRate: number
): { lineTotalExVat: number; lineVatAmount: number; lineTotalInclVat: number } => {
  
  let lineTotalExVat = 0;
  let lineVatAmount = 0;
  let lineTotalInclVat = 0;

  if (vatMode === VatMode.EXEMPT) {
    lineTotalExVat = round2(unitPrice * quantity);
    lineVatAmount = 0;
    lineTotalInclVat = lineTotalExVat;
  } else if (vatMode === VatMode.INCLUSIVE) {
    // Price includes VAT. We need to extract base.
    // Base = Price / (1 + Rate)
    const unitPriceExVat = unitPrice / (1 + vatRate);
    const unitVat = unitPrice - unitPriceExVat;

    lineTotalExVat = round2(unitPriceExVat * quantity);
    lineVatAmount = round2(unitVat * quantity);
    lineTotalInclVat = round2(unitPrice * quantity);
  } else {
    // Exclusive (Standard logic)
    // VAT = Price * Rate
    const unitVat = unitPrice * vatRate;
    
    lineTotalExVat = round2(unitPrice * quantity);
    lineVatAmount = round2(unitVat * quantity);
    lineTotalInclVat = round2((unitPrice + unitVat) * quantity);
  }

  return {
    lineTotalExVat,
    lineVatAmount,
    lineTotalInclVat
  };
};

export const calculateOfferTotals = (items: OfferLineItem[]) => {
  const subtotalExVat = round2(items.reduce((acc, item) => acc + item.lineTotalExVat, 0));
  const totalVat = round2(items.reduce((acc, item) => acc + item.lineVatAmount, 0));
  const grandTotal = round2(items.reduce((acc, item) => acc + item.lineTotalInclVat, 0));

  return {
    subtotalExVat,
    totalVat,
    grandTotal
  };
};

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};