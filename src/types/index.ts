export interface Employee {
  id: string;
  name: string;
  role: string;
  crewId?: string;
}

export interface PayrollEntry {
  jobName: string;
  jobNumber: string;
  amount: number;
  date: string;
}

export interface CrewPayroll {
  crewId: string;
  crewName: string;
  employees: {
    employeeId: string;
    name: string;
    entries: PayrollEntry[];
  }[];
}

export interface InventoryItem {
  id: string;
  jobName: string;
  jobNumber: string;
  manufacturerOrderNumber: string;
  itemType: 'windows' | 'siding' | 'security-doors' | 'entry-doors' | 'other';
  quantity: number;
  notes?: string;
  dateAdded: string;
}

export interface InventoryExport {
  id: string;
  title: string;
  data: InventoryItem[];
  exportDate: string;
}

export type ProductType = InventoryItem['itemType'];

export interface FileUpload {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadDate: string;
  jobId: string;
}

export interface PunchListItem {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'needed' | 'ordered' | 'received';
  orderDate?: string;
  receivedDate?: string;
  notes?: string;
}

export interface WalkthroughForm {
  id: string;
  jobId: string;
  completionDate: string;
  clientName: string;
  clientSignature?: string;
  installationIssues: {
    description: string;
    severity: 'minor' | 'moderate' | 'major';
    resolution?: string;
  }[];
  manufacturingIssues: {
    description: string;
    severity: 'minor' | 'moderate' | 'major';
    resolution?: string;
  }[];
  paymentStatus: 'pending' | 'partial' | 'complete';
  paymentAmount: number;
  followUpNeeded: boolean;
  followUpNotes?: string;
  photos: FileUpload[];
}

export type ConfiguratorStep = 
  | 'product-type'
  | 'series'
  | 'dimensions'
  | 'operation'
  | 'color'
  | 'glass'
  | 'hardware'
  | 'screen'
  | 'review';

export interface ConfiguratorItem {
  id: string;
  productType: ProductType;
  series: string;
  width: number;
  height: number;
  operation: string;
  frameColor: string;
  glassType: string;
  hardware: string;
  screenType: string;
  quantity: number;
  unitPrice: number;
}

export interface ConfiguratorQuote {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: ConfiguratorItem[];
  createdAt: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  totalAmount: number;
}

export type Theme = 'light' | 'dark' | 'tokyo-night' | 'andromeda';