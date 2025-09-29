import { Controller, Get, Param, ValidationPipe, UsePipes } from '@nestjs/common';
import { RupService } from './rup.service';
import { RupRequestDto } from './dto/rup-request.dto';
import { RupResponseDto } from './dto/rup-response.dto';

@Controller('api')
export class RupController {
  constructor(private readonly rupService: RupService) {}

  @Get(':kd_klpd/:tahun/rup/:kd_satker')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRupData(
    @Param('kd_klpd') kd_klpd: string,
    @Param('tahun') tahun: string,
    @Param('kd_satker') kd_satker: string,
  ): Promise<RupResponseDto> {
    // Validate the parameters using the DTO
    const requestDto = new RupRequestDto();
    requestDto.kd_klpd = kd_klpd;
    requestDto.tahun = tahun;
    requestDto.kd_satker = kd_satker;

    // Validate the DTO
    const validationPipe = new ValidationPipe({ transform: true });
    await validationPipe.transform(requestDto, { type: 'body' });

    return this.rupService.getRupData(kd_klpd, tahun, kd_satker);
  }
}
