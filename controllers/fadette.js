const dbNeo4j = require("../config/database");

async function createFadette(req, res) {
  try {
    const query = `
        CREATE (f:Fadette
        {date: $date, heure: $heure, type_appel: $type_appel, 
        destination: $destination, duree: $duree, source: $source, num_site: $num_site})
      `;

    const params = {
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
    } catch (err) {
      console.error("Error running Neo4j query for item", currentItem, err);
    }
    res.status(200).json({ success: true, message: "Add a new fadette" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: `Error present when adding: ${error}` });
  }
}

module.exports = { createFadette };
