import { readdirSync } from 'fs';
import { join } from 'path';
import { ActivityType, Client as BaseClient, Collection } from 'discord.js';
import Command from './Command';

class Client extends BaseClient {
  commands: Collection<string, Command>;
  developers: string[];

  constructor() {
    super({
      intents: ['Guilds'],
      presence: {
        status: process.env.NODE_ENV === 'development' ? 'dnd' : 'online',
        activities: [
          { name: 'SECRETAAAAAAAAAAAARIA', type: ActivityType.Listening },
        ],
      },
    });

    this.commands = new Collection();
    this.developers = process.env.DEVELOPERS;
    this.registryEvents();
    this.registryCommands();
  }

  private registryEvents() {
    const events = readdirSync(`${process.cwd()}/src/events`).filter(
      (f) => f.endsWith('.ts') || f.endsWith('.js')
    );

    for (const event of events) {
      const EventBase = require(join(
        `${process.cwd()}/src/events/${event}`
      )).default;
      const evt = new EventBase(this);

      this.on(evt.name, (...args) => evt.handle(...args));
    }
  }

  private registryCommands() {
    const commands = readdirSync(`${process.cwd()}/src/commands`).filter(
      (f) => f.endsWith('.ts') || f.endsWith('.js')
    );

    for (const command of commands) {
      const CommandBase = require(join(
        `${process.cwd()}/src/commands/${command}`
      )).default;
      const cmd = new CommandBase(this);

      this.commands.set(cmd.name, cmd);
    }
  }

  connect() {
    this.login(process.env.TOKEN);
  }
}

export default Client;
