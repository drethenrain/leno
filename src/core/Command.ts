import { ApplicationCommandOptionData, Interaction } from 'discord.js';
import Client from './Client';

type Config = {
  name: string;
  description: string;
  devOnly?: boolean;
  options?: ApplicationCommandOptionData[];
};

class Command {
  client: Client;
  config: Config;

  name: string;
  description: string;
  options?: object;

  constructor(client: Client, config: Config) {
    this.client = client;
    this.name = config.name;
    this.description = config.description;
    this.options = config.options;
  }

  handle(...args) { }
}

export default Command;
