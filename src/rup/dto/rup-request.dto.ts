import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RupRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]\d+$/, { message: 'kd_klpd must be in format like D197' })
  kd_klpd: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, { message: 'tahun must be a 4-digit year' })
  tahun: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'kd_satker must be numeric' })
  kd_satker: string;
}
