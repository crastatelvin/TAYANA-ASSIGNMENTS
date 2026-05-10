import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config();

async function resetCollection() {
    const client = new QdrantClient({
        url: process.env.QDRANT_URL!,
        apiKey: process.env.QDRANT_API_KEY,
    });

    const collectionName = "rag_documents";

    try {
        console.log(`Deleting collection: ${collectionName}`);
        await client.deleteCollection(collectionName);
        console.log('✅ Collection deleted.');
    } catch (err) {
        console.error('❌ Could not delete collection (it might not exist):', err);
    }
}

resetCollection();
