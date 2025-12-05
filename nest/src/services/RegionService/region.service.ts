import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Region } from "../../entities/Region/region.entity";
import { Settlement } from "../../entities/Settlement/settlement.entity";
import { School } from "../../entities/School/school.entity";

@Injectable()
export class RegionService {
    constructor(
        @InjectRepository(Region) private regionRepository: Repository<Region>,
        @InjectRepository(Settlement)
        private settlementRepository: Repository<Settlement>,
        @InjectRepository(School) private schoolRepository: Repository<School>,
    ) {}

    async getAllRegions(): Promise<Region[]> {
        return this.regionRepository.find();
    }

    async getSettlementsByRegion(regionId: number): Promise<Settlement[]> {
        return this.settlementRepository.find({ where: { regionId } });
    }

    async getSchoolsBySettlement(settlementId: number): Promise<School[]> {
        const schools = await this.schoolRepository.find({
            where: { settlementId },
        });
        return schools.map((school) => ({
            ...school,
            name: this.stripCityPrefix(school.name),
        }));
    }

    private stripCityPrefix(name: string): string {
        const cityPrefixPatterns = [
            /^г\.\s+[^,]*,\s*/i,
            /^г\s+[^,]*,\s*/i,
            /^город\s+[^,]*,\s*/i,
            /^[^,]*,\s*/,
        ];

        for (const pattern of cityPrefixPatterns) {
            if (pattern.test(name)) {
                return name.replace(pattern, "").trim();
            }
        }

        return name;
    }

    async createRegion(name: string): Promise<Region> {
        const region = this.regionRepository.create({ name });
        return this.regionRepository.save(region);
    }

    async createSettlement(
        regionId: number,
        name: string,
    ): Promise<Settlement> {
        const settlement = this.settlementRepository.create({ regionId, name });
        return this.settlementRepository.save(settlement);
    }

    async createSchool(settlementId: number, name: string): Promise<School> {
        const school = this.schoolRepository.create({ settlementId, name });
        return this.schoolRepository.save(school);
    }
}
