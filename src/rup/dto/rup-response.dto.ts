import { RupData } from '../interfaces/rup-data.interface';

export interface RupResponseDto {
  success: boolean;
  data?: RupData[]; // Array of RUP data objects
  message?: string;
  totalRecords?: number;
  kd_klpd: string;
  tahun: string;
  kd_satker: string;
  source_url: string;
}
