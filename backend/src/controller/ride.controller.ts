import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Costumer, RideService } from 'src/service/ride.service';

@Controller('ride')
export class RideController {
  constructor(private riseService: RideService) {}

  @Post('estimate')
  async estimate(@Body() costumer: Costumer, @Res() res: Response) {
    try {
      return res.status(200).json(await this.riseService.estimate(costumer));
    } catch (error_description) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description,
      });
    }
  }
}
