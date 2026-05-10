import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config();

async function checkConnection() {
    const client = new QdrantClient({
        url: process.env.QDRANT_URL!,
        apiKey: process.env.QDRANT_API_KEY || undefined,
    });

    console.log('--- Connecting to Qdrant ---');
    console.log('URL:', process.env.QDRANT_URL);

    try {
        const result = await client.getCollections();
        console.log('✅ Connection Successful!');
        console.log('List of collections:', result.collections);
    } catch (err) {
        console.error('❌ Could not get collections:', err);
    }
}

checkConnection();
