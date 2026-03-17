export enum VatMode {
  INCLUSIVE = 'INCLUDES_VAT',
  EXCLUSIVE = 'EXCLUDES_VAT',
  EXEMPT = 'NON_VAT'
}

export enum OfferStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REFUSED = 'REFUSED',
  ORDERED = 'ORDERED'
}

export enum ItemType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE'
}

export enum Currency {
  RON = 'RON',
  EUR = 'EUR',
  USD = 'USD'
}

export interface CompanyProfile {
  companyName: string;
  cui: string;
  regNo: string;
  address: string;
  phone: string;
  email: string;
  iban?: string;
  bank?: string;
  defaultCurrency: Currency;
  vatPayer: boolean;
  defaultVatRate: number;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface CatalogItem {
  id: string;
  type: ItemType;
  name: string;
  description?: string;
  unit: string;
  unitPrice: number;
  vatMode: VatMode;
  vatRate: number;
  stock?: number;
}

export interface OfferLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatMode: VatMode;
  vatRate: number;
  lineTotalExVat: number;
  lineVatAmount: number;
  lineTotalInclVat: number;
}

export interface Offer {
  id: string;
  offerNumber: string;
  createdAt: string;
  validUntil: string;
  status: OfferStatus;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientAddress?: string;
  currency: Currency;
  items: OfferLineItem[];
  subtotalExVat: number;
  totalVat: number;
  grandTotal: number;
  notes?: string;
  template: 'classic' | 'minimal';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'AGENT';
  isLoggedIn: boolean;
}