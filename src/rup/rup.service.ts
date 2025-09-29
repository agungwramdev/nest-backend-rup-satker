import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ParquetReader } from '@dsnp/parquetjs';
import { RupRequestDto } from './dto/rup-request.dto';
import { RupResponseDto } from './dto/rup-response.dto';
import { RupData } from './interfaces/rup-data.interface';

@Injectable()
export class RupService {
  private readonly baseUrl = 'https://s3-sip.pbj.my.id/rup';

  async getRupData(kd_klpd: string, tahun: string, kd_satker: string): Promise<RupResponseDto> {
    try {
      // Construct the URL for PP (PaketPenyedia) dataset
      const dataUrl = `${this.baseUrl}/${kd_klpd}/RUP-PaketPenyedia-Terumumkan/${tahun}/data.parquet`;
      
      console.log(`Mencoba mengakses URL: ${dataUrl}`);
      
      // Fetch the parquet file
      const response = await axios.get(dataUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Accept': 'application/octet-stream',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
      });

      console.log(`Response status: ${response.status}, Content-Length: ${response.headers['content-length']}`);

      // For now, return a sample response structure
      // In production, you would parse the parquet file here
      const sampleData: RupData[] = [
        {
          tahun_anggaran: parseInt(tahun),
          kd_klpd: kd_klpd,
          nama_klpd: "Provinsi Kalimantan Barat",
          jenis_klpd: "PROVINSI",
          kd_satker: parseInt(kd_satker),
          kd_satker_str: "1.02.0.00.0.00.03.0000",
          nama_satker: "RUMAH SAKIT JIWA PROVINSI KALIMANTAN BARAT",
          kd_rup: 53540979,
          nama_paket: "Belanja Bahan Makanan dan Minuman Pasien",
          pagu: 7700000000,
          kd_metode_pengadaan: 13,
          metode_pengadaan: "Tender",
          kd_jenis_pengadaan: "1",
          jenis_pengadaan: "Barang",
          status_pradipa: "PraDIPA",
          status_pdn: "PDN",
          status_ukm: "UKM",
          alasan_non_ukm: null,
          status_konsolidasi: "Non-Konsolidasi",
          tipe_paket: "Penyedia",
          kd_rup_swakelola: null,
          kd_rup_lokal: null,
          volume_pekerjaan: "1 paket",
          urarian_pekerjaan: "Belanja Bahan Makanan dan Minuman Pasien",
          spesifikasi_pekerjaan: "Belanja Bahan Makanan dan Minuman Pasien",
          tgl_awal_pemilihan: "2024-11-01",
          tgl_akhir_pemilihan: "2024-12-01",
          tgl_awal_kontrak: "2025-01-01",
          tgl_akhir_kontrak: "2025-12-01",
          tgl_awal_pemanfaatan: "2025-01-01",
          tgl_akhir_pemanfaatan: "2025-12-01",
          tgl_buat_paket: "2024-11-22",
          tgl_pengumuman_paket: "2024-11-22 22:22:47",
          nip_ppk: "197606132006041012",
          nama_ppk: "dr. Batara Hendra Putra Sianipar",
          username_ppk: "batara.ppk24-97",
          status_aktif_rup: true,
          status_delete_rup: false,
          status_umumkan_rup: "Terumumkan",
          status_dikecualikan: false,
          alasan_dikecualikan: "",
          tahun_pertama: null,
          kode_rup_tahun_pertama: null,
          nomor_kontrak: null,
          spp_aspek_ekonomi: false,
          spp_aspek_sosial: false,
          spp_aspek_lingkungan: false,
          _event_date: "2025-09-29"
        }
      ];
      
      console.log(`Sample data generated for ${kd_klpd}/${tahun}/${kd_satker}`);
      
      return {
        success: true,
        data: sampleData, // Return sample data in the correct format
        totalRecords: sampleData.length,
        kd_klpd,
        tahun,
        kd_satker,
        source_url: dataUrl,
        message: `Data berhasil diambil. Ini adalah sample data untuk ${kd_klpd}/${tahun}/${kd_satker}. Untuk data real, implementasi parsing parquet diperlukan.`
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
              source_url: `${this.baseUrl}/${kd_klpd}/RUP-PaketPenyedia-Terumumkan/${tahun}/data.parquet`,
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
