export interface VendorInput {
  name: string;
  description?: string;
}

export interface Vendor extends VendorInput {
  id: string;
  archived: boolean;
}

export interface VendorWithStats extends Vendor {
  description?: string;
  transactionCount: number;
  lastUsedAt?: string;
  archived: boolean;
}

export interface VendorDeleteError {
  status: 409;
  error: 'VENDOR_IN_USE';
  message: string;
  transactionCount: number;
  vendorId: string;
}

export interface VendorsPage {
  items: VendorWithStats[];
  nextCursor: string | null;
}
