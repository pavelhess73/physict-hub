import { Client, Databases, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Appwrite Endpoint
    .setProject('VASI_PROJECT_ID'); // ZDE DOPLNÍTE SVÉ PROJECT ID

export const databases = new Databases(client);
export const account = new Account(client);
export { ID } from 'appwrite';
