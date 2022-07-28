import Client from '../core/Client';
import Event from '../core/Event';

export default class extends Event {
  constructor(client: Client) {
    super(client, {
      name: 'ready',
    });
  }

  async handle() {
    console.log(`${this.client.user.tag} acordou`);
    this.client.application.commands.set(this.client.commands as any);
  }
}
