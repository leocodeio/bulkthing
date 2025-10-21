import { IYtCreatorEntity } from '../../domain/models/yt-creator.model';
import { IYtCreatorRepository } from '../../domain/ports/yt-creator.repository';
import { CreateEntryDto } from '../dtos/create-entry.dto';
import { GetCreatorEntryModel } from '../../domain/enums/get-creator-entry.model';
import { validateGetQuery } from '../functions/validate-get-query.function';
import { UpdateEntryDto } from '../dtos/update-entry.dto';

export class YtCreatorService {
  constructor(private readonly ytCreatorRepository: IYtCreatorRepository) {}

  async createCreatorEntry(creatorDto: CreateEntryDto): Promise<IYtCreatorEntity> {
    try {
      console.log('[YtCreatorService] Creating creator entry:', creatorDto);
      const creator = await this.ytCreatorRepository.save(creatorDto);
      console.log('[YtCreatorService] Creator created:', creator);
      return creator;
    } catch (error) {
      console.error('[YtCreatorService] Creator creation failed:', error);
      throw new Error('Creator not created');
    }
  }

  async getCreatorEntries(query: GetCreatorEntryModel): Promise<IYtCreatorEntity[]> {
    try {
      console.log('[YtCreatorService] Searching with query:', query);
      const validatedQuery = validateGetQuery(query);
      const creators = await this.ytCreatorRepository.find(validatedQuery);
      return creators;
    } catch (error) {
      console.error('[YtCreatorService] Creator search failed:', error);
      throw error;
    }
  }

  async updateCreatorEntry(
    id: string,
    updateDto: UpdateEntryDto,
  ): Promise<IYtCreatorEntity> {
    try {
      if (!id) {
        throw new Error('Id is required');
      }

      console.log('[YtCreatorService] Updating creator:', { id, updateDto });

      const existingCreator = await this.ytCreatorRepository.findById(id);

      if (!existingCreator) {
        console.error('[YtCreatorService] Creator not found:', id);
        throw new Error('Creator not found');
      }

      const updatedCreator: IYtCreatorEntity = {
        ...existingCreator,
        ...updateDto,
        updatedAt: new Date(),
      };

      const creator = await this.ytCreatorRepository.save(updatedCreator);
      console.log('[YtCreatorService] Creator updated:', creator);
      return creator;
    } catch (error) {
      console.error('[YtCreatorService] Creator update failed:', error);
      throw error;
    }
  }

  async deleteCreatorEntry(id: string): Promise<string> {
    try {
      const isCreatorExist = await this.ytCreatorRepository.findById(id);
      console.log('[YtCreatorService] Checking creator:', id);

      if (!isCreatorExist) {
        throw new Error('Creator not found');
      }

      console.log('[YtCreatorService] Deleting creator:', id);
      await this.ytCreatorRepository.delete(id);
      console.log('[YtCreatorService] Creator deleted:', id);
      return `Creator with Id ${id} deleted successfully!!!`;
    } catch (error) {
      console.error('[YtCreatorService] Creator deletion failed:', error);
      throw error;
    }
  }

  async getCreatorEntryByEmail(email: string): Promise<IYtCreatorEntity | null> {
    return this.ytCreatorRepository.findByEmail(email);
  }

  async getCreatorEntryById(id: string): Promise<IYtCreatorEntity | null> {
    return this.ytCreatorRepository.findById(id);
  }
}
