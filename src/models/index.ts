import { farmModel } from './farm';
import { itemModel } from './item';
import { terrainModel } from './terrain';
import { userModel } from './user';

export const db = {
	user: userModel,
	item: itemModel,
	farm: farmModel,
	terrain: terrainModel,
};
