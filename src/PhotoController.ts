/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
import { Request, Response } from 'express';
import { Client } from 'pg';

import getClient from './client/elasticsearch';

class PhotoController {
  async create(request: Request, response: Response) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      password: 'docker',
      user: 'postgres',
    });

    await client.connect();

    const { rows } = await client.query('SELECT * FROM PHOTOS');

    for await (const row of rows) {
      await getClient().index(
        {
          index: 'photos',
          type: 'type_photos',
          body: row,
        },
        erro => {
          if (erro) {
            return response.status(400).json({ error: erro });
          }
        },
      );
    }

    return response.json({ message: 'Index ok!' });
  }

  async findAll(request: Request, response: Response) {
    const dataInicial = new Date().getTime();

    const data = await getClient().search({
      index: 'photos',
      size: 6000,
    });

    const dataFinal = new Date().getTime();

    console.log('O resultado do elasticsearch foi ', dataFinal - dataInicial);

    return response.json(data);
  }

  async findById(request: Request, response: Response) {
    const { id } = request.params;

    const data = await getClient().search({
      index: 'photos',
      q: `id:${id}`,
    });

    return response.json(data.hits.hits);
  }

  async createPhoto(request: Request, response: Response) {
    const photo = {
      albumid: null,
      id: 9999,
      title: 'Title de teste',
      url: 'https://teste.com',
      thumbnailurl: null,
    };

    const data = await getClient().index({
      index: 'photos',
      type: 'type_photos',
      body: photo,
    });

    return response.json(data);
  }

  async findByQuery(request: Request, response: Response) {
    const data = await getClient().search({
      index: 'photos',
      body: {
        query: {
          match: {
            title: 'minima',
          },
        },
      },
    });

    return response.json(data);
  }
}

export default new PhotoController();
