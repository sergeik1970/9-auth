import { DataSource } from "typeorm";
import { migrations, entities } from "./migrations";

export default new DataSource({
    type: "postgres",
    host: "127.0.0.1",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",
    entities: entities,
    migrations: migrations,
});
