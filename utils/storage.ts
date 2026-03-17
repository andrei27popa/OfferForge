import { CompanyProfile, CatalogItem, Offer, Currency, Client, User } from '../types';

const KEYS = {
  PROFILE: 'offerforge_profile',
  CATALOG: 'offerforge_catalog',
  OFFERS: 'offerforge_offers',
  CLIENTS: 'offerforge_clients',
  USER: 'offerforge_user'
};

// --- Auth ---
export const getUserSession = (): User | null => {
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveUserSession = (user: User) => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const clearUserSession = () => {
  localStorage.removeItem(KEYS.USER);
};

// --- Clients ---
export const getClients = (): Client[] => {
  const data = localStorage.getItem(KEYS.CLIENTS);
  return data ? JSON.parse(data) : [];
};

export const saveClient = (client: Client) => {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === client.id || (c.name === client.name && c.company === client.company));
  if (index >= 0) {
    clients[index] = { ...clients[index], ...client };
  } else {
    clients.unshift(client);
  }
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
};

export const deleteClient = (id: string) => {
  const clients = getClients().filter(c => c.id !== id);
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
};

// --- Common ---
export const getCompanyProfile = (): CompanyProfile => {
  const data = localStorage.getItem(KEYS.PROFILE);
  if (data) return JSON.parse(data);
  return {
    companyName: '', cui: '', regNo: '', address: '', phone: '', email: '',
    defaultCurrency: Currency.RON, vatPayer: true, defaultVatRate: 0.19
  };
};

export const saveCompanyProfile = (profile: CompanyProfile) => {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const getCatalog = (): CatalogItem[] => {
  const data = localStorage.getItem(KEYS.CATALOG);
  return data ? JSON.parse(data) : [];
};

export const saveCatalogItem = (item: CatalogItem) => {
  const items = getCatalog();
  const index = items.findIndex(i => i.id === item.id);
  if (index >= 0) items[index] = item;
  else items.push(item);
  localStorage.setItem(KEYS.CATALOG, JSON.stringify(items));
};

export const deleteCatalogItem = (id: string) => {
  const items = getCatalog().filter(i => i.id !== id);
  localStorage.setItem(KEYS.CATALOG, JSON.stringify(items));
};

export const getOffers = (): Offer[] => {
  const data = localStorage.getItem(KEYS.OFFERS);
  return data ? JSON.parse(data) : [];
};

export const getOfferById = (id: string): Offer | undefined => {
  return getOffers().find(o => o.id === id);
};

export const saveOffer = (offer: Offer) => {
  const offers = getOffers();
  const index = offers.findIndex(o => o.id === offer.id);
  if (index >= 0) offers[index] = offer;
  else offers.unshift(offer);
  localStorage.setItem(KEYS.OFFERS, JSON.stringify(offers));
};

export const getNextOfferNumber = (): string => {
  const offers = getOffers();
  const currentYear = new Date().getFullYear();
  const count = offers.filter(o => o.createdAt.startsWith(currentYear.toString())).length;
  return `OFR-${currentYear}-${String(count + 1).padStart(4, '0')}`;
};