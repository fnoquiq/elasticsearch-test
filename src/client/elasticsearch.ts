import elasticsearch, { Client } from 'elasticsearch';

function getClient(): Client {
  const client = new elasticsearch.Client({
    host: 'localhost:9200',
    // log: 'trace',
  });

  return client;
}

export default getClient;
