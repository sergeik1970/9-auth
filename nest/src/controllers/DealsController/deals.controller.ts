import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
} from "@nestjs/common";
import { DealsService } from "../../services/DealsService/deal.service";
import { Deals } from "src/entities/Deals/deals.entity";

@Controller()
export class DealsController {
    constructor(private readonly dealService: DealsService) {}

    @Get("deals/get")
    getAllDeals() {
        return this.dealService.getAllDeals();
    }

    @Post("deals/add")
    createDeal(@Body() { name }: { name: string }) {
        if (name.trim()) {
            return this.dealService.createDeal(name);
        } else {
            throw new HttpException("eror", HttpStatus.NOT_ACCEPTABLE);
        }
    }

    @Delete("deals/delete/:id")
    deleteDeal(@Param() params: any) {
        if (params.id) {
            return this.dealService.deleteDeal(params.id);
        } else {
            throw new HttpException("eror", HttpStatus.NOT_ACCEPTABLE);
        }
    }

    @Patch("deals/change/:id")
    changeDeal(@Param() params: any, @Body() { data }: { data: Deals }) {
        if (params.id) {
            return this.dealService.changeDeal(params.id, data);
        }
    }
}
