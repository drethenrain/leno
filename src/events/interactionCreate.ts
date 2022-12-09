import { Interaction } from 'discord.js';

import Client from '../core/Client';
import Event from '../core/Event';

export default class extends Event {
  constructor(client: Client) {
    super(client, {
      name: 'interactionCreate',
    });
  }

  async handle(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) return;

    try {
      const command = this.client.commands.get(interaction.commandName);
      if (!command) return;

      command.handle(interaction);
    } catch (error) {
      interaction.reply({
        content: 'Deu erro',
        ephemeral: true,
      });
    }
  }
}
