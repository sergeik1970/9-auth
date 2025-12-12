import { DataSource } from 'typeorm';
import { User } from './entities/User/user.entity';
import { Test } from './entities/Test/test.entity';
import { TestAttempt } from './entities/TestAttempt/testAttempt.entity';
import { Question } from './entities/Question/question.entity';
import { QuestionOption } from './entities/QuestionOption/questionOption.entity';
import { TestAnswer } from './entities/TestAnswer/testAnswer.entity';
import { Region } from './entities/Region/region.entity';
import { Settlement } from './entities/Settlement/settlement.entity';
import { School } from './entities/School/school.entity';
import { Deals } from './entities/Deals/deals.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.NODE_ENV == 'dev' ? '127.0.0.1' : 'db',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: [User, Test, TestAttempt, Question, QuestionOption, TestAnswer, Region, Settlement, School, Deals],
  migrations: ['migrations/*.ts'],
  migrationsRun: false,
  synchronize: false,
});
