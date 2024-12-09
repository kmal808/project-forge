import Dexie, { Table } from 'dexie';
import type {
  InventoryItem,
  CrewPayroll,
  MaterialItem,
  PunchListItem,
  FileUpload,
  WalkthroughForm,
  ConfiguratorQuote,
} from '../types';

export class AppDatabase extends Dexie {
  inventory!: Table<InventoryItem>;
  payroll!: Table<CrewPayroll>;
  materials!: Table<MaterialItem>;
  punchList!: Table<PunchListItem>;
  files!: Table<FileUpload>;
  walkthroughs!: Table<WalkthroughForm>;
  quotes!: Table<ConfiguratorQuote>;

  constructor() {
    super('constructionCRM');
    
    this.version(1).stores({
      inventory: '++id, jobName, jobNumber, itemType, dateAdded',
      payroll: '++crewId, crewName',
      materials: '++id, name, status',
      punchList: '++id, status, priority',
      files: '++id, jobId, uploadDate',
      walkthroughs: '++id, jobId, completionDate',
      quotes: '++id, customerName, status, createdAt',
    });
  }
}

export const db = new AppDatabase();