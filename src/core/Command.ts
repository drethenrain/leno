import { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import Client from './Client';

interface Config {
  name: string;
  description: string;
  devOnly?: boolean;
  options?: ApplicationCommandOptionData[];
};

class Command {
  client: Client;

  name: string;
  description: string;
  options: ApplicationCommandOptionData[];

  constructor(client: Client, data: Config) {
    Object.assign(this, data);

    this.client = client;
  }

  handle(interaction: any) {
    return {
      ...interaction
    }
  }
}

export default Command;
