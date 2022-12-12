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
  constructor(client: Client) {
    super(client, {
      name: 'bovespa',
      description: 'Retorna alguma ação listada na bolsa',
      options: [
        {
          name: 'stock',
          type: ApplicationCommandOptionType.String,
          description: 'Nome da ação',
        },
      ],
    });
  }

  async handle(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder();
    try {
      const stockValue = interaction.options.getString('stock');
      const requestAll = await this.requestAllStocks();

      if (stockValue) {
        const data = await this.requestStock(stockValue);
        const data2 = requestAll.find(
          (a) => a.stock === stockValue.toUpperCase()
        );

        interaction.reply({
          embeds: [
            embed.setTitle(`${data2.name} (${data.symbol})`).addFields([
              {
                name: 'Nome',
                value: `${data.longName}`,
                inline: true,
              },
              {
                name: 'Setor',
                value: `${data2.sector}`,
                inline: true,
              },
              {
                name: 'Preço de mercado',
                value: currencyFormatToBRL(data.regularMarketPrice),
              },
              {
                name: 'Abertura',
                value: `${currencyFormatToBRL(
                  data.historicalDataPrice[0].open
                )}`,
                inline: true,
              },
              {
                name: 'Fechamento',
                value: `${currencyFormatToBRL(
                  data.historicalDataPrice[0].close
                )}`,
                inline: true,
              },
              {
                name: 'Baixa e Alta',
                value: `${currencyFormatToBRL(
                  data.historicalDataPrice[0].low
                )} - ${currencyFormatToBRL(data.historicalDataPrice[0].high)}`,
                inline: true,
              },
            ]),
          ],
        });
      } else {
        interaction.reply({
          embeds: [
            embed
              .setTitle('Lista de ações listadas na Bovespa')
              .setDescription(
                requestAll.map((d) => `${d.name} - ${d.stock}`).join('\n')
              )
              .setFooter({
                text: `Mostrando apenas ${requestAll.length} ações`,
              }),
          ],
        });
      }
    } catch (error) {
      interaction.reply('Achei não');
    }
  }

  private async requestAllStocks() {
    const { body } = await request(`https://brapi.dev/api/quote/list?limit=60`);
    const { stocks } = await body.json();

    return stocks;
  }

  private async requestStock(stock: string) {
    const { body } = await request(
      `https://brapi.dev/api/quote/${encodeURIComponent(
        stock
      )}?range=1d&interval=1d&fundamental=true`
    );
    const { results } = await body.json();

    return results[0];
  }
}
