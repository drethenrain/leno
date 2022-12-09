import { CommandInteraction } from 'discord.js';

import Client from '../core/Client';
import Command from '../core/Command';

export default class extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'ping',
      description: 'Mostra o ping do bot',
    });
  }

  handle(interaction: CommandInteraction) {
    interaction.reply(`:ping_pong: ${this.client.ws.ping}ms`);
  }
}
