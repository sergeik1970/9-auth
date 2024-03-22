import { Deals } from "./src/entities/Deals/deals.entity";

import { CreateDeals1708260275634 } from "./migrations/1708260275634-CreateDeals";
import { DeleteTest1708260920831 } from "./migrations/1708260920831-DeleteTest";
import { AddDone1711132304989 } from "./migrations/1711132304989-AddDone";

export const entities = [Deals];
export const migrations = [
    CreateDeals1708260275634,
    DeleteTest1708260920831,
    AddDone1711132304989,
];
