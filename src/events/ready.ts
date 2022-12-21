import Client from '../core/Client';
import Event from '../core/Event';

export default class extends Event {
  constructor(client: Client) {
    super(client, {
      name: 'ready',
      emitter: 'once'
    });
  }

  handle() {
    this.client.application.commands.set(this.client.commands);

    console.log(`${this.client.user.tag} acordou`);
  }
}
