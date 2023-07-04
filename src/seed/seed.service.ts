import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SEED_ITEMS, SEED_USERS, SEED_LISTS } from './data/seed-data';

import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { ListItem } from '../list-item/entities/list-item.entity';
import { List } from '../list/entities/list.entity';

import { ListService } from '../list/list.service';
import { ListItemService } from '../list-item/list-item.service';
import { ItemsService } from '../items/items.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListService,
    private readonly listItemService: ListItemService,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  async executeSeed() {
    if (this.isProd) {
      throw new UnauthorizedException('We cannot run SEED on Prod');
    }
    // limpiar la BD
    await this.deleteDatabase();
    // crear usuarios
    const user = await this.loadUsers();
    // crear items
    await this.loadItems(user);
    // crear listas
    const list = await this.loadLists(user);
    // crear listItems
    const items = await this.itemsService.findAll(
      user,
      { limit: 15, offset: 0 },
      {},
    );
    await this.loadListItems(list, items);

    return true;
  }

  async deleteDatabase() {
    // delete listItems
    await this.listItemRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // delete list
    await this.listRepository.createQueryBuilder().delete().where({}).execute();

    // delete items
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // delete users
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadUsers(): Promise<User> {
    const users = [];
    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }

    return users[0];
  }

  async loadItems(user: User): Promise<void> {
    const itemPromises = [];
    for (const item of SEED_ITEMS) {
      itemPromises.push(await this.itemsService.create(item, user));
    }
    await Promise.all(itemPromises);
  }

  async loadLists(user: User): Promise<List> {
    const lists = [];
    for (const list of SEED_LISTS) {
      lists.push(await this.listsService.create(list, user));
    }
    return lists[0];
  }

  async loadListItems(list: List, items: Item[]) {
    for (const item of items) {
      this.listItemService.create({
        quantity: Math.round(Math.random() * 10),
        completed: Math.round(Math.random() * 1) === 0 ? false : true,
        listId: list.id,
        itemId: item.id,
      });
    }
  }
}
