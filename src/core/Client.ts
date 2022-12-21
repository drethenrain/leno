import { ActivityType, Client as BaseClient } from 'discord.js';

import Command from './Command';
import Event from './Event';
import { readFolder } from '../utils';

type Constructable<T> = new (...args: unknown[]) => T;

class Client extends BaseClient {
  commands: Command[]
  developers: string[];

  constructor() {
    super({
      intents: ['Guilds', 'GuildMembers'],
      presence: {
        status: process.env.NODE_ENV === 'development' ? 'dnd' : 'online',
        activities: [
          { name: 'Caneta Azul', type: ActivityType.Listening },
        ],
      },
    });

    this.developers = process.env.DEVELOPERS;
    this.registryEvents();
    this.registryCommands();
  }

  private registryEvents() {
    readFolder<Constructable<Event>>('../events')
      .map((Event) => new Event(this))
      .forEach((evt) => this[evt.emitter](evt.name, (...args: unknown[]) => evt.handle(...args)));

    return this;
  }

  private registryCommands() {
    this.commands = readFolder<Constructable<Command>>('../commands')
      .map((Command) => new Command(this));

    return this;
  }

  connect() {
    this.login(process.env.TOKEN);
  }
}

export default Client;
