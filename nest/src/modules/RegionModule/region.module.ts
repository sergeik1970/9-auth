import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RegionController } from "../../controllers/RegionController/region.controller";
import { RegionService } from "../../services/RegionService/region.service";
import { Region } from "../../entities/Region/region.entity";
import { Settlement } from "../../entities/Settlement/settlement.entity";
import { School } from "../../entities/School/school.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Region, Settlement, School])],
    controllers: [RegionController],
    providers: [RegionService],
    exports: [RegionService],
})
export class RegionModule {}
