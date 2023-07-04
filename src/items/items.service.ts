import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';
@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user });
    await this.itemsRepository.save(newItem);
    return newItem;
  }

  async findAll(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<Item[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.itemsRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }
    return queryBuilder.getMany();

    // return await this.itemsRepository.find({
    //   take: limit,
    //   skip: offset,
    //   where: {
    //     user: {
    //       id: user.id,
    //     },
    //     name: Like(`%${search}%`),
    //   },
    // });
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });
    if (!item) throw new NotFoundException(`Item whit ${id} not found`);
    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);
    // Buscamos el Item por el updateItemInput
    const item = await this.itemsRepository.preload(updateItemInput);
    if (!item) throw new NotFoundException(`Item whit ${id} not found`);
    // Actualizamos la entidad ITEM de la BD
    return this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    // TODO: soft remove, integridad referencial
    // buscamos el Item
    const item = await this.findOne(id, user);
    // eliminamos el item mediante el remove y la entidad ITEM de la BD
    await this.itemsRepository.remove(item);

    return { ...item, id };
  }

  async itemCountByUser(user: User): Promise<number> {
    return this.itemsRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}
