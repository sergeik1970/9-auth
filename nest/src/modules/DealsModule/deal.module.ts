import { Module } from "@nestjs/common";
import { DealsService } from "src/services/DealsService/deal.service";
import { DealsController } from "src/controllers/DealsController/deals.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Deals } from "src/entities/Deals/deals.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Deals])],
    controllers: [DealsController],
    providers: [DealsService],
})
export class DealsModule {}
