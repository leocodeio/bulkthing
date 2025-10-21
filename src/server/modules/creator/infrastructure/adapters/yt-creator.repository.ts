import { prisma } from '@/server/db';
import { IYtCreatorEntity } from '../../domain/models/yt-creator.model';
import { IYtCreatorRepository } from '../../domain/ports/yt-creator.repository';
import { GetCreatorEntryModel } from '../../domain/enums/get-creator-entry.model';
import { YtCreatorStatus } from '../../domain/enums/yt-creator-status.enum';

export class YtCreatorRepository implements IYtCreatorRepository {
  async find(query: GetCreatorEntryModel): Promise<IYtCreatorEntity[]> {
    const where: any = {};

    if (query.id) {
      where.id = query.id;
    }
    if (query.creatorId) {
      where.creatorId = query.creatorId;
    }
    if (query.email) {
      where.email = query.email;
    }
    if (query.status) {
      where.status = query.status;
    }

    return prisma.ytCreator.findMany({ where });
  }

  async save(creator: IYtCreatorEntity): Promise<IYtCreatorEntity> {
    if (creator.id) {
      return prisma.ytCreator.update({
        where: { id: creator.id },
        data: {
          creatorId: creator.creatorId,
          email: creator.email,
          accessToken: creator.accessToken,
          refreshToken: creator.refreshToken,
          status: creator.status,
          updatedAt: new Date(),
        },
      });
    }

    return prisma.ytCreator.create({
      data: {
        creatorId: creator.creatorId,
        email: creator.email,
        accessToken: creator.accessToken,
        refreshToken: creator.refreshToken,
        status: creator.status,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.ytCreator.delete({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<IYtCreatorEntity | null> {
    return prisma.ytCreator.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<IYtCreatorEntity | null> {
    return prisma.ytCreator.findUnique({
      where: { id },
    });
  }
}
