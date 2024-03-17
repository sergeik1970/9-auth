import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
} from "@nestjs/common";
import { DealsService } from "../../services/DealsService/deal.service";

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
}
