const { dbNeo4j } = require("./config/database");

async function testNeo4j() {
    try {
        const result = await dbNeo4j.run("RETURN 'Neo4j Connection OK' AS message");
        console.log(result.records[0].get("message"));
    } catch (error) {
        console.error("Neo4j Connection Error:", error);
    } finally {
        await dbNeo4j.close();
    }
}

testNeo4j();
