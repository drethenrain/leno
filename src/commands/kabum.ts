import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { request } from 'undici';

import Client from '../core/Client';
import Command from '../core/Command';
import { currencyFormatToBRL } from '../utils';

export default class extends Command {
  private baseUrl: string;
  private productUrl: (id: string) => string;

  constructor(client: Client) {
    super(client, {
      name: 'kabum',
      description: 'Pesquisa produtos na kabum.com.br',
      options: [
        {
          name: 'produto',
          type: ApplicationCommandOptionType.String,
          description: 'Nome do produto',
          required: true,
        },
      ],
    });

    this.baseUrl = 'https://servicespub.prod.api.aws.grupokabum.com.br';
    this.productUrl = (id: string) => `https://www.kabum.com.br/produto/${id}`;
  }

  async handle(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder();
    try {
      const searchValue = interaction.options.getString('produto');
      const products = await this.searchProduct(searchValue);

      embed
        .setTitle(`Resultados para: ${searchValue} ou similares`)
        .setDescription(
          products
            .map(
              (product) =>
                `${currencyFormatToBRL(product.price)} - [${
                  product.title
                }](${product.link}) (${product.id}) `
            )
            .join('\n')
        )
        .setFooter({
          text: `Produtos encontrados: ${products.length}`,
        });

      interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      interaction.reply('Achei não');
    }
  }

  private async searchProduct(product: string) {
    const { body } = await request(
      `${this.baseUrl}/catalog/v2/products?query=${product}&page_size=15`,
      {
        headers: {
          'user-agent': 'Mozilla/5.0 Chrome/108.0.0.0 Safari/537.36',
        },
      }
    );

    const { data } = await body.json();

    const products = [];
    for (const product of data) {
      const { id, attributes } = product;

      products.push({
        id,
        title: attributes.title,
        price: attributes.price,
        link: this.productUrl(id),
        photos: attributes.photos,
      });
    }
    return products;
  }
}
