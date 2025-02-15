const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");
const { connectNeo4j } = require("../config/database");

let db;
(async () => {
  db = await connectMongo.connectMongo();
})();

async function createAffairs(req, res) {
  try {
    const uniqueId = ID.generate(new Date().toJSON());


    await db.collection("affairs").insertOne({
      affairNumber: uniqueId,
      title: req.body.title,
      description: req.body.description,
      statut: req.body.statut,
      placeNumber: req.body.placeNumber,
    });


    const session = await connectNeo4j();

    await session.run(
        `
      MERGE (a:Affair {affairNumber: $affairNumber, title: $title, description: $description, statut: $statut})
      MERGE (p:Place {placeNumber: $placeNumber})
      MERGE (a)-[:OCCURRED_AT]->(p)
      `,
        {
          affairNumber: uniqueId,
          title: req.body.title,
          description: req.body.description,
          statut: req.body.statut,
          placeNumber: req.body.placeNumber,
        }
    );



    res.status(200).json({ success: true, message: "Added a new affair" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while adding: ${error}` });
  }
}

async function getAllAffairs(req, res) {
  try {
    const collection = db.collection("affairs");
    const query = await collection.aggregate([
      {
        $lookup: {
          from: "places",
          localField: "placeNumber",
          foreignField: "placeNumber",
          as: "place",
        },
      },
      {
        $lookup: {
          from: "testimonials",
          localField: "affairNumber",
          foreignField: "affairNumber",
          as: "testimonials",
        },
      },
      {
        $lookup: {
          from: "individuals",
          localField: "testimonials.individualNumber",
          foreignField: "individualNumber",
          as: "individuals",
        },
      },
    ]).toArray();

    res.status(200).json({ success: true, message: "All affairs", data: query });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while getting affairs: ${error}` });
  }
}

async function getByTitle(req, res) {
  try {
    const collection = db.collection("affairs");
    const query = await collection.find({ title: req.params.title }).toArray();

    if (query.length === 0) {
      res.status(404).json({
        success: false,
        message: `Affair ${req.params.title} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `Affair ${req.params.title} found`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while getting affair: ${error}` });
  }
}

async function getByAffairNumber(req, res) {
  try {
    const collection = db.collection("affairs");
    const query = await collection.find({ affairNumber: req.params.affairNumber }).toArray();

    if (query.length === 0) {
      res.status(404).json({
        success: false,
        message: `Affair ${req.params.affairNumber} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `Affair ${req.params.affairNumber} found`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while getting affair: ${error}` });
  }
}

async function updateAffair(req, res) {
  try {
    const collection = db.collection("affairs");
    const search = await collection.find({ affairNumber: req.params.affairNumber }).toArray();

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Affair ${req.params.affairNumber} not found`,
      });
    } else {
      await collection.updateOne(
          { affairNumber: req.params.affairNumber },
          {
            $set: {
              title: req.body.title,
              description: req.body.description,
              statut: req.body.statut,
              placeNumber: req.body.placeNumber,
            },
          }
      );

      res.status(200).json({ success: true, message: "Updated the affair" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while updating affair: ${error}` });
  }
}

async function deleteByAffairNumber(req, res) {
  try {
    const collection = db.collection("affairs");
    const search = await collection.find({ affairNumber: req.params.affairNumber }).toArray(); // Convert cursor to array

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Affair ${req.params.affairNumber} not found`,
      });
    } else {
      const query = await collection.deleteOne({ affairNumber: req.params.affairNumber });
      res.status(200).json({
        success: true,
        message: `Affair ${req.params.affairNumber} deleted`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while deleting affair: ${error}` });
  }
}

module.exports = {
  createAffairs,
  getAllAffairs,
  getByTitle,
  getByAffairNumber,
  updateAffair,
  deleteByAffairNumber,
};
