import { Client, Databases, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Appwrite Endpoint
    .setProject('6a17fbd7120cc796e1ea'); // ZDE DOPLNÍTE SVÉ PROJECT ID

export const databases = new Databases(client);
export const account = new Account(client);
export { ID } from 'appwrite';
