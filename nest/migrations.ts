import { Deals } from "./src/entities/Deals/deals.entity";

import { CreateDeals1708260275634 } from "./migrations/1708260275634-CreateDeals";
import { DeleteTest1708260920831 } from "./migrations/1708260920831-DeleteTest";

export const entities = [Deals];
export const migrations = [CreateDeals1708260275634, DeleteTest1708260920831];
