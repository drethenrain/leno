import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { request } from 'undici';

import Client from '../core/Client';
import Command from '../core/Command';

export default class extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'clima',
      description: 'Retorna o clima da city fiote',
      options: [
        {
          name: 'city',
          type: ApplicationCommandOptionType.String,
          description: 'Nome da city',
          required: true,
        },
      ],
    });
  }

  async handle(interaction: ChatInputCommandInteraction) {
    try {
      const cityValue = interaction.options.getString('city');
      const {
        city,
        coord,
        country,
        description,
        feelsLike,
        humidity,
        iconURL,
        region,
        temperature,
      } = await this.requestWeather(cityValue);

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setThumbnail(iconURL)
            .setTitle(`Tempo em ${city}/${region}, ${country}`)
            .addFields([
              { name: 'Clima', value: description },
              {
                name: 'Temperatura',
                value: `${temperature}°C`,
              },
              {
                name: 'Sensação Térmica',
                value: `${feelsLike}°C`,
              },
              {
                name: 'Humidade',
                value: `${humidity}%`,
              },
              {
                name: 'Coordenadas',
                value: `Latitude: \`${coord.lat}\`\nLongitude: \`${coord.lon}\``,
              },
            ]),
        ],
      });
    } catch (error) {
      interaction.reply('Achei não');
    }
  }

  private async requestWeather(city: string) {
    const { body } = await request(
      `https://api.weatherapi.com/v1/current.json`,
      {
        query: {
          key: process.env.WEATHER_KEY,
          lang: 'pt',
          q: encodeURIComponent(city),
          aqi: 'no',
        },
      }
    );

    const data = await body.json();

    return {
      city: data.location.name,
      region: data.location.region,
      country: data.location.country,
      coord: {
        lat: data.location.lat,
        lon: data.location.lon,
      },
      temperature: data.current.temp_c,
      feelsLike: data.current.feelslike_c,
      humidity: data.current.humidity,
      iconURL: `https:${data.current.condition.icon}`,
      description: data.current.condition.text,
    };
  }
}
