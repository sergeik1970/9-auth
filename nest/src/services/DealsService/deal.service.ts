// Декоратор, которым помечаются классы, которые могут быть внедрены через Dependency injection.
// Это означает, что Nest сможет создавать экземпляры этого сервиса и подставлять их в контроллеры
// или другие сервисы.
import { Injectable } from "@nestjs/common";
// Используется для внедрения репозитория typeORM для работы в базе данных.
import { InjectRepository } from "@nestjs/typeorm";
// Импорт сущности Deals - это класс, описывающий структуру таблицы в базе данных.
import { Deals } from "src/entities/Deals/deals.entity";
// Через него мы взаимодействуем с таблицей
import { Repository } from "typeorm";

// Объявление сервиса DealService и пометка его как Injectable - значит,
// что его можно использовать в контроллерах, других сервисах и тд через внедрение зависимостей.
@Injectable()
export class DealsService {
    // конструктор сервиса
    constructor(
        // Говорит NestJS - внедри сюда репозиторий для работы с Deals
        // Теперь это объект Repository<Deals>, который умеет выполнять CRUD операции с таблицей Deals.
        @InjectRepository(Deals)
        private readonly dealsRepository: Repository<Deals>,
    ) {}

    // Простой метод проверки работоспособности сервиса.
    getHello(): string {
        return JSON.stringify({ a: "Hello World!a" });
    }

    // Создание нового дела
    // Функция асинхронная, значит она возвращает промис.
    // name:string - аргумент метода, это имя новой сделки
    // Promise<Deals> - возвращаемый тип - это объект Deals
    async createDeal(name: string): Promise<Deals> {
        // Создание экземпляра сущности Deals, но не сохраненный в БД.
        const deal = this.dealsRepository.create({ name });
        // Сохранение дела в БД
        return this.dealsRepository.save(deal);
    }

    // Получение всех дел из БД.
    async getAllDeals(): Promise<Array<Deals>> {
        // Переворот массива, чтобы получить последние дела в начале
        return (await this.dealsRepository.find()).reverse();
    }

    // Удаление дела по id
    async deleteDeal(id: string): Promise<Array<Deals>> {
        // Удаление записи, где id совпадает с переданным параметром
        await this.dealsRepository.delete({ id: Number(id) });
        // Возращаем обновленный список
        return this.dealsRepository.find();
    }

    // Изменение дела по id
    async changeDeal(id: string, data: Deals): Promise<Deals> {
        // Обновление записи, где id совпадает с переданным параметром, применяя поле из data
        await this.dealsRepository.update(id, data);
        return (
            // Возращаем обновленный список
            (await this.dealsRepository.find({ where: { id: Number(id) } }))[0]
        );
    }
}
