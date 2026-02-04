export interface VendorInput {
  name: string;
}

export interface Vendor extends VendorInput {
  id: string;
}

export interface VendorWithStats extends Vendor {
  transactionCount: number;
  lastUsedAt?: string;
}

export interface VendorDeleteError {
  status: 409;
  error: 'VENDOR_IN_USE';
  message: string;
  transactionCount: number;
  vendorId: string;
}
