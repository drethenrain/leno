import { readdirSync } from 'fs';
import { join } from 'path';
import { ActivityType, Client as BaseClient, Collection } from 'discord.js';

class Client extends BaseClient {
  commands: Collection<unknown, unknown>;

  constructor() {
    super({
      intents: ['Guilds'],
      presence: {
        status: process.env.NODE_ENV === 'development' ? 'dnd' : 'online',
        activities: [
          { name: 'O Mito, é bolso neles!!', type: ActivityType.Watching },
        ],
      },
    });

    this.commands = new Collection();
    this.registryEvents();
    this.registryCommands();
  }

  registryEvents() {
    const events = readdirSync(`${process.cwd()}/src/events`);

    for (const event of events) {
      const EventBase = require(join(
        `${process.cwd()}/src/events/${event}`
      )).default;
      const evt = new EventBase(this);

      this.on(evt.name, (...args) => evt.handle(...args));
    }
  }

  registryCommands() {
    const commands = readdirSync(`${process.cwd()}/src/commands`);

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
