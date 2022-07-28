import Client from './Client';

type Options = {
  name: string;
};

class Event {
  client: Client;
  name: string;

  constructor(client: Client, options: Options) {
    this.client = client;
    this.name = options.name;
  }
}

export default Event;
