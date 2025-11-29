import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
} from "@nestjs/common";
import { RegionService } from "../../services/RegionService/region.service";

@Controller("regions")
export class RegionController {
    constructor(private regionService: RegionService) {}

    @Get()
    getAllRegions() {
        return this.regionService.getAllRegions();
    }

    @Get(":regionId/settlements")
    getSettlementsByRegion(@Param("regionId", ParseIntPipe) regionId: number) {
        return this.regionService.getSettlementsByRegion(regionId);
    }

    @Get("settlement/:settlementId/schools")
    getSchoolsBySettlement(
        @Param("settlementId", ParseIntPipe) settlementId: number,
    ) {
        return this.regionService.getSchoolsBySettlement(settlementId);
    }

    @Post()
    createRegion(@Body("name") name: string) {
        return this.regionService.createRegion(name);
    }

    @Post(":regionId/settlements")
    createSettlement(
        @Param("regionId", ParseIntPipe) regionId: number,
        @Body("name") name: string,
    ) {
        return this.regionService.createSettlement(regionId, name);
    }

    @Post("settlement/:settlementId/schools")
    createSchool(
        @Param("settlementId", ParseIntPipe) settlementId: number,
        @Body("name") name: string,
    ) {
        return this.regionService.createSchool(settlementId, name);
    }
}
