import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Costumer, RideService } from 'src/service/ride.service';

type Order = {
  customer_id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  driver: {
    id: number;
    name: string;
  };
  value: number;
};

type RideError = {
  code: number;
  error_description: string;
  error_code: 'INVALID_DATA' | 'DRIVER_NOT_FOUND' | 'INVALID_DISTANCE';
};

@Controller('ride')
export class RideController {
  constructor(private rideService: RideService) {}

  @Post('estimate')
  async estimate(@Body() costumer: Costumer, @Res() res: Response) {
    try {
      return res.status(200).json(await this.rideService.estimate(costumer));
    } catch (error_description) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description,
      });
    }
  }
  private handleError(error: RideError, res: Response) {
    const { code, ..._error } = {
      code: 400,
      ...error,
    } as RideError;
    return res.status(code).json(_error);
  }
  @Patch('confirm')
  async confirm(@Body() order: Order, @Res() res: Response) {
    try {
      await this.rideService.confirm(order);
      return res.status(200).json({ success: true });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  @Get(':customer_id')
  async rides(
    @Param('customer_id') customer_id: string,
    @Query('driver_id') driver_id: number,
    @Res() res: Response,
  ) {
    try {
      return res.status(200).json(
        await this.rideService.rides({
          customer_id,
          driver_id,
        }),
      );
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
