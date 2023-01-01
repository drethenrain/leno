import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { decode } from 'ent';
import { request } from 'undici';

import Client from '../core/Client';
import Command from '../core/Command';
import { currencyFormatToBRL } from '../utils';

export default class extends Command {
  private baseUrl: string;
  private productUrl: (id: string) => string;

  constructor(client: Client) {
    super(client, {
      name: 'kabum-details',
      description: 'Retorna detalhe de um produto na kabum',
      options: [
        {
          name: 'produto',
          type: ApplicationCommandOptionType.Number,
          description: 'id/codigo do produto',
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
      const productValue = interaction.options.getNumber('produto');
      const product = await this.productDetails(productValue);

      embed
        .setTitle(product.name)
        .setImage(product.photos[0])
        .addFields([
          {
            name: 'Preço',
            value: currencyFormatToBRL(product.price),
            inline: true,
          },
          {
            name: 'Disponivel?:',
            value: product.available ? 'Sim' : 'Não',
            inline: true,
          },
          {
            name: 'Marca',
            value: product.manufacturer,
            inline: true,
          },
        ]);

      const getButtons = (toggle = false, choice?: string) => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('details')
            .setStyle(
              toggle === true && choice === 'details'
                ? ButtonStyle.Secondary
                : ButtonStyle.Success
            )
            .setLabel('Detalhes')
            .setDisabled(toggle),

          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(product.link)
            .setLabel('Link')
        );

        return row;
      };

      interaction.reply({
        embeds: [embed],
        components: [getButtons()],
      });

      const collector = interaction.channel.createMessageComponentCollector({
        filter: (i) => i.customId === 'details',
        time: 15000,
      });

      collector.on('collect', async (i) => {
        embed.setDescription(
          product.description.length > 4096
            ? 'Limite de caracteres para detalhes acima do limite. (Veja os detalhes no site)'
            : product.description
        );
        if (!i.isButton()) return;

        await i.deferUpdate();

        i.editReply({
          components: [getButtons(true, 'details')],
          embeds: [embed],
        });
      });

      collector.on('end', (_collected) => {
        interaction.editReply({
          components: [getButtons(true, 'details')],
          embeds: [embed],
        });
      });
    } catch (error) {
      interaction.reply('Achei não');
    }
  }

  private async productDetails(id: number) {
    const { body } = await request(
      `${this.baseUrl}/descricao/v2/descricao/produto/${id}`,
      {
        headers: {
          'user-agent': 'Mozilla/5.0 Chrome/108.0.0.0 Safari/537.36',
        },
      }
    );
    const data = await body.json();

    return {
      id: data.codigo,
      name: data.nome,
      price: data.preco,
      oldPrice: data.preco_antigo,
      available: data.disponibilidade,
      manufacturer: data.fabricante.nome,
      photos: data.fotos,
      description: decode(data.produto_html).replace(/(<[^>]+>)+/g, '\n'),
      link: this.productUrl(data.codigo),
    };
  }
}
