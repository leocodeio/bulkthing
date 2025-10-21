import { GetCreatorEntryModel } from '../../domain/enums/get-creator-entry.model';

export function validateGetQuery(query: GetCreatorEntryModel): GetCreatorEntryModel {
  const validated: GetCreatorEntryModel = {};

  if (query.id) {
    validated.id = query.id;
  }
  if (query.creatorId) {
    validated.creatorId = query.creatorId;
  }
  if (query.email) {
    validated.email = query.email;
  }
  if (query.status) {
    validated.status = query.status;
  }

  return validated;
}
