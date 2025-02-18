const dbNeo4j = require("../config/database");
const ID = require("nodejs-unique-numeric-id-generator");

async function addFadetteRelation(data, fadetteNumber) {
  const caller = data.source;
  const receiver = data.destination;
  const site = data.num_site;
  const call = fadetteNumber;
  const dateTime = `${data.date} ${data.heure}`;

  // Create 'CALLED' relationship
  const query1 = `
    MATCH (caller:Individual) WHERE caller.phone=$caller
    MATCH (receiver:Individual) WHERE receiver.phone=$receiver
    CREATE (caller)-[:CALLED {date_time: $dateTime}]->(receiver)
  `;
  await dbNeo4j.dbNeo4j.run(query1, { caller:caller, receiver:receiver, dateTime: dateTime });

  // Create 'RECEIVED_CALL' relationship
  const query2 = `
    MATCH (caller:Individual) WHERE caller.phone=$caller
    MATCH (receiver:Individual) WHERE receiver.phone=$receiver
    CREATE (receiver)-[:RECEIVED_CALL {date_time: $dateTime}]->(caller)
  `;
  await dbNeo4j.dbNeo4j.run(query2, { caller: caller, receiver: receiver, dateTime: dateTime });

  // Create 'EMITTED_BY' relationship
  const query3 = `
    MATCH (call:Fadette) WHERE call.fadetteNumber=$call
    MATCH (caller:Individual) WHERE caller.phone=$caller
    CREATE (call)-[:EMITTED_BY {date_time: $dateTime}]->(caller)
  `;
  await dbNeo4j.dbNeo4j.run(query3, { call: call, caller: caller, dateTime: dateTime });

  // Create 'RECEIVED_BY' relationship
  const query4 = `
    MATCH (call:Fadette) WHERE call.fadetteNumber=$call
    MATCH (receiver:Individual) WHERE receiver.phone=$receiver
    CREATE (call)-[:RECEIVED_BY {date_time: $dateTime}]->(receiver)
  `;
  await dbNeo4j.dbNeo4j.run(query4, { call: call, receiver: receiver, dateTime: dateTime });

  // Create 'TRANSITED_BY' relationship
  const query5 = `
    MATCH (call:Fadette) WHERE call.fadetteNumber=$call
    MATCH (site:Site) WHERE site.num_site=$site
    CREATE (call)-[:TRANSITED_BY {date_time: $dateTime}]->(site)
  `;
  await dbNeo4j.dbNeo4j.run(query5, { call: call, site: site, dateTime: dateTime });
}

async function createFadette(req, res) {
  try {
    const uniqueId = ID.generate(new Date().toJSON());

    const query = `
        CREATE (f:Fadette
        {fadetteNumber: $fadetteNumber, date: $date, heure: $heure, type_appel: $type_appel, 
        destination: $destination, duree: $duree, source: $source, num_site: $num_site})
      `;

    const params = {
      fadetteNumber: uniqueId,
      date: req.body.date,
      heure: req.body.heure,
      type_appel: req.body.type_appel,
      destination: req.body.destination,
      duree: req.body.duree,
      source: req.body.source,
      num_site: req.body.num_site,
    };

    try {
      await dbNeo4j.dbNeo4j.run(query, params);
      await addFadetteRelation(params, uniqueId);
    } catch (err) {
      console.error("Error running Neo4j query", err);
    }
    res.status(200).json({ success: true, message: "Add a new fadette" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: `Error present when adding: ${error}` });
  }
}




async function getFadettesBySiteAndTime(req, res) {
  try {
    const { site, startDate, endDate, startHour, endHour } = req.query;


    const query = `
      MATCH (f:Fadette)-[:TRANSITED_BY]->(s:Site {num_site: $site})
      WHERE f.date >= $startDate AND f.date <= $endDate
        AND f.heure >= $startHour AND f.heure <= $endHour
      OPTIONAL MATCH (f)-[:EMITTED_BY|RECEIVED_BY]->(i:Individual)
      RETURN f, s, collect(DISTINCT i) as individuals
    `;

    // Exécution de la requête
    const result = await dbNeo4j.dbNeo4j.run(query, { site, startDate, endDate, startHour, endHour });

    // Transformation du résultat en un format JSON
    const data = result.records.map(record => {
      const fadette = record.get("f").properties;
      const siteNode = record.get("s").properties;
      const individuals = record.get("individuals")?.map(ind => ind.properties) || [];
      return {
        fadette,
        site: siteNode,
        individuals
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error retrieving fadettes by site and time:", error);
    res.status(500).json({ success: false, message: `Error: ${error}` });
  }
}









async function getFadetteByPhone(req, res) {
  try {
    const phoneNumber = req.params.phoneNumber;
    const query = `
    MATCH (f:Fadette)-[r:EMITTED_BY|RECEIVED_BY]->(i:Individual {phone: $phoneNumber})
    RETURN f, i
    `;

    const result = await dbNeo4j.dbNeo4j.run(query, { phoneNumber });

    // Transforme le résultat en JSON
    const data = result.records.map(record => ({
      fadette: record.get("f").properties,
      individual: record.get("i").properties
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error retrieving fadettes by phone:", error);
    res.status(500).json({ success: false, message: `Error: ${error}` });
  }


}


const connectMongo = require("../config/database");

async function getIndividualFadettesAndAffairs(req, res) {
  try {
    const phoneNumber = req.params.phoneNumber;

    const queryNeo4j = `
      MATCH (f:Fadette)-[:EMITTED_BY|RECEIVED_BY]->(i:Individual {phone: $phoneNumber})
      RETURN f, i
    `;
    const resultNeo4j = await dbNeo4j.dbNeo4j.run(queryNeo4j, { phoneNumber });

    const fadettes = resultNeo4j.records.map(record => ({
      fadette: record.get("f").properties,
      individual: record.get("i").properties
    }));

    const db = await connectMongo.connectMongo();

    if (!db) {
      console.error("Erreur : MongoDB non connecté !");
      return res.status(500).json({ success: false, message: "MongoDB non connecté !" });
    }

    const collection = db.collection("affairs");
    const affairs = await collection
        .aggregate([
          {
            $lookup: {
              from: "testimonials",
              localField: "affairNumber",
              foreignField: "affairNumber",
              as: "testimonials"
            }
          },
          {
            $match: { "testimonials.individualNumber": phoneNumber }
          }
        ])
        .toArray();

    /** Retourner la réponse combinée */
    res.status(200).json({
      success: true,
      individualPhone: phoneNumber,
      fadettes,
      affairs
    });

  } catch (error) {
    console.error("Erreur récupération des données :", error);
    res.status(500).json({ success: false, message: `Erreur : ${error}` });
  }
}

module.exports = { getIndividualFadettesAndAffairs };



















module.exports = { createFadette, getFadetteByPhone, getFadettesBySiteAndTime, getIndividualFadettesAndAffairs };
