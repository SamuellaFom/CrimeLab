const dbNeo4j = require("../config/database");
const XLSX = require("xlsx");

async function convertToJson(path, name) {
  let finalObject = {};

  const data = XLSX.read(path, {
    type: "file",
  });

  const options = {
    cellDates: true,
    defval: null,
    raw: false,
  };

  data.SheetNames.forEach((sheet) => {
    let rowObject = XLSX.utils.sheet_to_json(data.Sheets[sheet], options);
    finalObject[name] = rowObject;
  });

  return finalObject;
}

async function sendToDb() {
  const data = await convertToJson("./files/2024_t2_sites_metropoles_bis.xlsx", "Metropole");

  try {
    for (const currentItem of data.Metropole) {
      const query = `
        CREATE (s:Site 
        {nom_op: $nom_op, num_site: $num_site, id_station_anfr: $id_station_anfr, 
        latitude: $latitude, longitude: $longitude, x: $x, y: $y,
        nom_reg: $nom_reg,
        nom_dep: $nom_dep,
        insee_dep: $insee_dep,
        nom_com: $nom_com})
      `;

      const params = {
        nom_op: currentItem.nom_op,
        num_site: currentItem.num_site,
        latitude: currentItem.latitude,
        id_station_anfr: currentItem.id_station_anfr,
        longitude: currentItem.longitude,
        x: currentItem.x,
        y: currentItem.y,
        nom_dep: currentItem.nom_dep,
        nom_reg: currentItem.nom_reg,
        insee_dep: currentItem.insee_dep,
        nom_com: currentItem.nom_com
      };

      try {
        await dbNeo4j.dbNeo4j.run(query, params);
      } catch (err) {
        console.error(
          "Error running Neo4j query for item",
          currentItem,
          err
        );
      }
    }
  } catch (err) {
    console.error("General error when processing JSON data :", err);
  } finally {
    try {
      await dbNeo4j.dbNeo4j.close();
    } catch (err) {
      console.error("Erreur lors de la fermeture de la connexion Neo4j :", err);
    }

    process.exit(0);
  } 
}

sendToDb();
