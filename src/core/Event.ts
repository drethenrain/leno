import Client from './Client';

interface EventOptions {
  name: string;
  emitter: 'on' | 'once';
};

class Event {
  emitter: string;
  client: Client;
  name: string;

  constructor(client: Client, data: EventOptions) {
    this.client = client;

    this.name = data.name;
    this.emitter = data.emitter;
  }

  handle(...args: any) {
    return { ...args };
  }
}

export default Event;
