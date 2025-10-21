import { IYtCreatorEntity } from '../models/yt-creator.model';
import { GetCreatorEntryModel } from '../enums/get-creator-entry.model';

export interface IYtCreatorRepository {
  find(query: GetCreatorEntryModel): Promise<IYtCreatorEntity[]>;
  save(creator: IYtCreatorEntity): Promise<IYtCreatorEntity>;
  delete(id: string): Promise<void>;
  findByEmail(email: string): Promise<IYtCreatorEntity | null>;
  findById(id: string): Promise<IYtCreatorEntity | null>;
}
