import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const findReplicaSet = async () => {
    const host = "ac-bmemyyg-shard-00-00.65v61eg.mongodb.net:27017";
    const user = "crastatelvin_db_user";
    const pass = "Kallu%40Mallu";
    const uri = `mongodb://${user}:${pass}@${host}/?ssl=true&authSource=admin`;

    const client = new MongoClient(uri);

    try {
        console.log("Connecting to single host to find replica set name...");
        await client.connect();
        const isMaster = await client.db('admin').command({ isMaster: 1 });
        console.log("Replica Set Name:", isMaster.setName);
        process.exit(0);
    } catch (error) {
        console.error("Failed to get info:", error);
        process.exit(1);
    }
};

findReplicaSet();
