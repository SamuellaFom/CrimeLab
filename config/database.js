const path = require("path");
const { MongoClient } = require("mongodb");
const neo4j = require("neo4j-driver");
const config = require(path.join(__dirname, "/../config/config.json"));

const client = new MongoClient(config["mongo"].uri);


async function connectMongo() {
  try {
    await client.connect();
    return client.db(config["mongo"].dbName);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err; // Re-throw to handle it in the calling function
  }
}

const driver = neo4j.driver(
  config["neo4j"].uri,
  neo4j.auth.basic(config["neo4j"].username, config["neo4j"].password)
);
const dbNeo4j = driver.session();

module.exports = { connectMongo, dbNeo4j };
