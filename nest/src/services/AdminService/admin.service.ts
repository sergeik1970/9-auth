import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { User, UserRole } from "src/entities/User/user.entity";
import { Test } from "src/entities/Test/test.entity";
import {
    TestAttempt,
    AttemptStatus,
} from "src/entities/TestAttempt/testAttempt.entity";
import { Region } from "src/entities/Region/region.entity";
import { School } from "src/entities/School/school.entity";
import { Settlement } from "src/entities/Settlement/settlement.entity";

export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
    classNumber?: number;
    classLetter?: string;
    schoolId?: number;
    regionId?: number;
    settlementId?: number;
}

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Test)
        private readonly testRepository: Repository<Test>,
        @InjectRepository(TestAttempt)
        private readonly attemptRepository: Repository<TestAttempt>,
        @InjectRepository(Region)
        private readonly regionRepository: Repository<Region>,
        @InjectRepository(School)
        private readonly schoolRepository: Repository<School>,
        @InjectRepository(Settlement)
        private readonly settlementRepository: Repository<Settlement>,
    ) {}

    async getAllUsers(user: JwtPayload): Promise<any[]> {
        if (user.role !== "admin") {
            throw new ForbiddenException(
                "Only admins can access this resource",
            );
        }

        const users = await this.userRepository.find({
            relations: ["createdTests", "region", "school", "testAttempts"],
            order: { createdAt: "DESC" },
        });

        return Promise.all(
            users.map(async (u) => {
                const completedAttempts = await this.attemptRepository.count({
                    where: { userId: u.id, status: AttemptStatus.COMPLETED },
                });

                const totalAttempts = await this.attemptRepository.count({
                    where: { userId: u.id },
                });

                return {
                    id: u.id,
                    email: u.email,
                    name: u.name,
                    lastName: u.lastName,
                    patronymic: u.patronymic,
                    role: u.role,
                    classNumber: u.classNumber,
                    classLetter: u.classLetter,
                    regionId: u.regionId,
                    regionName: u.region?.name || null,
                    schoolId: u.schoolId,
                    schoolName: u.school?.name || null,
                    educationalInstitutionCustom:
                        u.educationalInstitutionCustom,
                    completedTests: completedAttempts,
                    totalAttempts: totalAttempts,
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt,
                };
            }),
        );
    }

    async getUserById(id: number, user: JwtPayload): Promise<any> {
        if (user.role !== "admin") {
            throw new ForbiddenException(
                "Only admins can access this resource",
            );
        }

        const targetUser = await this.userRepository.findOne({
            where: { id },
            relations: ["createdTests", "region", "school", "testAttempts"],
        });

        if (!targetUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const completedAttempts = await this.attemptRepository.count({
            where: { userId: id, status: AttemptStatus.COMPLETED },
        });

        const totalAttempts = await this.attemptRepository.count({
            where: { userId: id },
        });

        return {
            id: targetUser.id,
            email: targetUser.email,
            name: targetUser.name,
            lastName: targetUser.lastName,
            patronymic: targetUser.patronymic,
            role: targetUser.role,
            classNumber: targetUser.classNumber,
            classLetter: targetUser.classLetter,
            regionId: targetUser.regionId,
            regionName: targetUser.region?.name || null,
            schoolId: targetUser.schoolId,
            schoolName: targetUser.school?.name || null,
            educationalInstitutionCustom:
                targetUser.educationalInstitutionCustom,
            completedTests: completedAttempts,
            totalAttempts: totalAttempts,
            createdAt: targetUser.createdAt,
            updatedAt: targetUser.updatedAt,
        };
    }

    async updateUser(
        id: number,
        updateData: any,
        user: JwtPayload,
    ): Promise<User> {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can update users");
        }

        const targetUser = await this.userRepository.findOne({
            where: { id },
        });

        if (!targetUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Обновляем поля
        if (updateData.name !== undefined) targetUser.name = updateData.name;
        if (updateData.lastName !== undefined)
            targetUser.lastName = updateData.lastName;
        if (updateData.patronymic !== undefined)
            targetUser.patronymic = updateData.patronymic;
        if (updateData.email !== undefined) targetUser.email = updateData.email;
        if (updateData.role !== undefined) targetUser.role = updateData.role;
        if (updateData.regionId !== undefined)
            targetUser.regionId = updateData.regionId;
        if (updateData.settlementId !== undefined)
            targetUser.settlementId = updateData.settlementId;
        if (updateData.schoolId !== undefined)
            targetUser.schoolId = updateData.schoolId;
        if (updateData.classNumber !== undefined)
            targetUser.classNumber = updateData.classNumber;
        if (updateData.classLetter !== undefined)
            targetUser.classLetter = updateData.classLetter;
        if (updateData.educationalInstitutionCustom !== undefined)
            targetUser.educationalInstitutionCustom =
                updateData.educationalInstitutionCustom;

        const updated = await this.userRepository.save(targetUser);

        return {
            ...updated,
            password: undefined,
        } as User;
    }

    async deleteUser(
        id: number,
        user: JwtPayload,
    ): Promise<{ message: string }> {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can delete users");
        }

        if (id === user.sub) {
            throw new ForbiddenException("You cannot delete yourself");
        }

        const targetUser = await this.userRepository.findOne({
            where: { id },
        });

        if (!targetUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        await this.userRepository.remove(targetUser);

        return { message: "User deleted successfully" };
    }

    async createSettlement(
        regionId: number,
        name: string,
        user: JwtPayload,
    ): Promise<Settlement> {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can create settlements");
        }

        if (!regionId || !name) {
            throw new BadRequestException("Region ID and name are required");
        }

        const region = await this.regionRepository.findOne({
            where: { id: regionId },
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${regionId} not found`);
        }

        const existingSettlement = await this.settlementRepository.findOne({
            where: { name, regionId },
        });

        if (existingSettlement) {
            throw new BadRequestException(
                `Settlement with name "${name}" already exists in this region`,
            );
        }

        const settlement = this.settlementRepository.create({
            name,
            regionId,
        });

        return await this.settlementRepository.save(settlement);
    }

    async getSettlements(
        regionId?: number,
        user?: JwtPayload,
    ): Promise<Settlement[]> {
        if (user && user.role !== "admin") {
            throw new ForbiddenException(
                "Only admins can access this resource",
            );
        }

        if (regionId) {
            const region = await this.regionRepository.findOne({
                where: { id: regionId },
            });

            if (!region) {
                throw new NotFoundException(
                    `Region with ID ${regionId} not found`,
                );
            }

            return await this.settlementRepository.find({
                where: { regionId },
                relations: ["region", "schools"],
            });
        }

        return await this.settlementRepository.find({
            relations: ["region", "schools"],
        });
    }

    async createSchool(
        regionId: number,
        settlementId: number,
        name: string,
        user: JwtPayload,
    ): Promise<School> {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can create schools");
        }

        if (!regionId || !settlementId || !name) {
            throw new BadRequestException(
                "Region ID, Settlement ID, and name are required",
            );
        }

        const region = await this.regionRepository.findOne({
            where: { id: regionId },
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${regionId} not found`);
        }

        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId, regionId },
        });

        if (!settlement) {
            throw new NotFoundException(
                `Settlement with ID ${settlementId} not found in this region`,
            );
        }

        const existingSchool = await this.schoolRepository.findOne({
            where: { name, settlementId },
        });

        if (existingSchool) {
            throw new BadRequestException(
                `School with name "${name}" already exists in this settlement`,
            );
        }

        const school = this.schoolRepository.create({
            name,
            settlementId,
        });

        return await this.schoolRepository.save(school);
    }

    async getSchools(
        settlementId?: number,
        user?: JwtPayload,
    ): Promise<School[]> {
        if (user && user.role !== "admin") {
            throw new ForbiddenException(
                "Only admins can access this resource",
            );
        }

        if (settlementId) {
            const settlement = await this.settlementRepository.findOne({
                where: { id: settlementId },
            });

            if (!settlement) {
                throw new NotFoundException(
                    `Settlement with ID ${settlementId} not found`,
                );
            }

            return await this.schoolRepository.find({
                where: { settlementId },
                relations: ["settlement"],
            });
        }

        return await this.schoolRepository.find({
            relations: ["settlement"],
        });
    }

    async getSchoolById(id: number, user: JwtPayload): Promise<School> {
        if (user.role !== "admin") {
            throw new ForbiddenException(
                "Only admins can access this resource",
            );
        }

        const school = await this.schoolRepository.findOne({
            where: { id },
            relations: ["settlement"],
        });

        if (!school) {
            throw new NotFoundException(`School with ID ${id} not found`);
        }

        return school;
    }

    async updateSchool(
        id: number,
        regionId: number,
        settlementId: number,
        name: string,
        user: JwtPayload,
    ): Promise<School> {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can update schools");
        }

        if (!regionId || !settlementId || !name) {
            throw new BadRequestException(
                "Region ID, Settlement ID, and name are required",
            );
        }

        const school = await this.schoolRepository.findOne({
            where: { id },
        });

        if (!school) {
            throw new NotFoundException(`School with ID ${id} not found`);
        }

        const region = await this.regionRepository.findOne({
            where: { id: regionId },
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${regionId} not found`);
        }

        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId, regionId },
        });

        if (!settlement) {
            throw new NotFoundException(
                `Settlement with ID ${settlementId} not found in this region`,
            );
        }

        const existingSchool = await this.schoolRepository.findOne({
            where: { name, settlementId, id: Not(id) },
        });

        if (existingSchool) {
            throw new BadRequestException(
                `School with name "${name}" already exists in this settlement`,
            );
        }

        school.name = name;
        school.settlementId = settlementId;

        return await this.schoolRepository.save(school);
    }

    async deleteSchool(
        id: number,
        user: JwtPayload,
    ): Promise<{ message: string }> {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can delete schools");
        }

        const school = await this.schoolRepository.findOne({
            where: { id },
        });

        if (!school) {
            throw new NotFoundException(`School with ID ${id} not found`);
        }

        await this.schoolRepository.remove(school);

        return { message: "School deleted successfully" };
    }

    async getRegions(user: JwtPayload): Promise<Region[]> {
        if (user.role !== "admin") {
            throw new ForbiddenException(
                "Only admins can access this resource",
            );
        }

        return await this.regionRepository.find({
            relations: ["settlements"],
            order: { name: "ASC" },
        });
    }

    async createRegion(name: string, user: JwtPayload): Promise<Region> {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can create regions");
        }

        if (!name || !name.trim()) {
            throw new BadRequestException("Region name is required");
        }

        const existingRegion = await this.regionRepository.findOne({
            where: { name: name.trim() },
        });

        if (existingRegion) {
            throw new BadRequestException(
                "Region with this name already exists",
            );
        }

        const region = this.regionRepository.create({ name: name.trim() });
        return await this.regionRepository.save(region);
    }
}
