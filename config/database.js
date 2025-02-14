const path = require("path");
const { MongoClient } = require("mongodb");
const neo4j = require("neo4j-driver");
const config = require(path.join(__dirname, "/../config/config.json"));

const client = new MongoClient(config["mongo"].uri);

async function connectMongo() {
  await client.connect();
  console.log("Connecté à MongoDB");
  return client.db(config["mongo"].dbName);
}

const driver = neo4j.driver(
  config["neo4j"].uri,
  neo4j.auth.basic(config["neo4j"].username, config["neo4j"].password)
);
const dbNeo4j = driver.session();

module.exports = { connectMongo, dbNeo4j };
