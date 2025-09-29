import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { RupRequestDto } from './dto/rup-request.dto';
import { RupResponseDto } from './dto/rup-response.dto';
import { RupData } from './interfaces/rup-data.interface';

@Injectable()
export class RupService {
  private readonly baseUrl = 'https://s3-sip.pbj.my.id/rup';

  async getRupData(kd_klpd: string, tahun: string, kd_satker: string): Promise<RupResponseDto> {
    try {
      // Construct the URL for PP (PaketPenyedia) dataset - using JSON format
      const dataUrl = `${this.baseUrl}/${kd_klpd}/RUP-PaketPenyedia-Terumumkan/${tahun}/data.json`;
      
      console.log(`Mencoba mengakses URL: ${dataUrl}`);
      
      // Fetch the JSON data
      const response = await axios.get(dataUrl, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
      });

      console.log(`Response status: ${response.status}, Content-Length: ${response.headers['content-length']}`);

      // Parse JSON data
      const allData: RupData[] = response.data;
      
      console.log(`Total records in JSON: ${allData.length}`);
      
      // Show sample of available data structure
      if (allData.length > 0) {
        console.log('Sample record structure:', Object.keys(allData[0]));
        console.log('Sample kd_satker values:', allData.slice(0, 5).map(item => ({ 
          kd_satker: item.kd_satker, 
          nama_satker: item.nama_satker 
        })));
      }
      
      // Filter data based on kd_satker, status_aktif_rup, and status_umumkan_rup
      const filteredData = allData.filter(item => {
        return item.kd_satker && 
               item.kd_satker.toString() === kd_satker &&
               item.status_aktif_rup === true &&
               item.status_umumkan_rup === "Terumumkan";
      });
      
      console.log(`Filtered records for kd_satker ${kd_satker}: ${filteredData.length}`);
      
      // If no data found for the specific satker, show available satkers
      if (filteredData.length === 0) {
        console.log('No exact match found, looking for similar satkers...');
        const uniqueSatkers = allData
          .filter(item => item.kd_satker && item.nama_satker)
          .map(item => ({ kd_satker: item.kd_satker, nama_satker: item.nama_satker }))
          .filter((item, index, self) => 
            self.findIndex(s => s.kd_satker === item.kd_satker) === index
          )
          .slice(0, 10); // Get first 10 unique satkers
        
        console.log('Available satkers in data:', uniqueSatkers);
      }
      
      return {
        success: true,
        data: filteredData, // Return all filtered records
        totalRecords: filteredData.length,
        kd_klpd,
        tahun,
        kd_satker,
        source_url: dataUrl,
        message: `Data real berhasil diambil dan difilter. Ditemukan ${filteredData.length} paket untuk satker ${kd_satker}`
      };

    } catch (error) {
      console.error('Error fetching RUP data:', error.message);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.status === 404) {
          throw new HttpException(
            {
              success: false,
              message: 'Data tidak ditemukan untuk parameter yang diberikan. Pastikan tahun dan kode K/L PD valid.',
              kd_klpd,
              tahun,
              kd_satker,
              source_url: `${this.baseUrl}/${kd_klpd}/RUP-PaketPenyedia-Terumumkan/${tahun}/data.json`,
              suggestion: 'Coba dengan tahun 2024 atau periksa kode K/L PD yang valid'
            },
            HttpStatus.NOT_FOUND
          );
        }
        
        if (error.code === 'ECONNABORTED') {
          throw new HttpException(
            {
              success: false,
              message: 'Timeout saat mengambil data dari SIRUP',
              kd_klpd,
              tahun,
              kd_satker
            },
            HttpStatus.REQUEST_TIMEOUT
          );
        }
      }

      throw new HttpException(
        {
          success: false,
          message: 'Terjadi kesalahan saat mengambil data dari SIRUP',
          kd_klpd,
          tahun,
          kd_satker,
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
