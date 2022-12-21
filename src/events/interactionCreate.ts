import { Interaction } from 'discord.js';

import Client from '../core/Client';
import Event from '../core/Event';

export default class extends Event {
  constructor(client: Client) {
    super(client, {
      name: 'interactionCreate',
      emitter: 'on'
    });
  }

  handle(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const command = this.client.commands.find((c) => c.name === interaction.commandName);
    command && command.handle(interaction);
  }
}
