const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");

let db;
(async () => {
  db = await connectMongo.connectMongo();
})();

/**
 * The function `createAffairs` creates a new affair entry in a database collection with unique ID and
 * specified details, and returns a success message with the generated affair number.
 */
async function createAffairs(req, res) {
  try {
    const uniqueId = ID.generate(new Date().toJSON());

    const query = await db.collection("affairs").insertOne({
      affairNumber: uniqueId,
      title: req.body.title,
      description: req.body.description,
      statut: req.body.statut,
      placeNumber: req.body.placeNumber,
      createdAt: new Date(),
      type: req.body.type,
    });

    res.status(200).json({
      success: true,
      message: "Added a new affair",
      affairNumber: uniqueId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while adding: ${error}`,
    });
  }
}

/**
 * The function `getAllAffairs` retrieves all affairs from a database, including related information
 * from other collections, and returns the data in a JSON response.
 */
async function getAllAffairs(req, res) {
  try {
    const collection = db.collection("affairs");
    const query = await collection
      .aggregate([
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
      ])
      .toArray();

    res
      .status(200)
      .json({ success: true, message: "All affairs", data: query });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while getting affairs: ${error}`,
    });
  }
}

/**
 * The function `getByAffairNumber` retrieves affair data based on the affair number, including
 * related information from other collections, and returns a response with the data if found or an
 * error message if not found.
 */
async function getByAffairNumber(req, res) {
  try {
    const collection = db.collection("affairs");
    const query = await collection
      .aggregate([
        {
          $match: { affairNumber: req.params.affairNumber },
        },
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
      ])
      .toArray();

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
    res.status(500).json({
      success: false,
      message: `Error occurred while getting affair: ${error}`,
    });
  }
}

/**
 * The function `updateAffair` updates an affair in a collection based on the provided affair number
 * and request body data.
 */
async function updateAffair(req, res) {
  try {
    const collection = db.collection("affairs");
    const search = await collection
      .find({ affairNumber: req.params.affairNumber })
      .toArray();

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
    res.status(500).json({
      success: false,
      message: `Error occurred while updating affair: ${error}`,
    });
  }
}

/**
 * The function `deleteByAffairNumber` deletes an affair from a collection based on the affair number
 * provided in the request parameters and returns a success message or an error message accordingly.
 */
async function deleteByAffairNumber(req, res) {
  try {
    const collection = db.collection("affairs");
    const search = await collection
      .find({ affairNumber: req.params.affairNumber })
      .toArray();

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Affair ${req.params.affairNumber} not found`,
      });
    } else {
      const query = await collection.deleteOne({
        affairNumber: req.params.affairNumber,
      });
      res.status(200).json({
        success: true,
        message: `Affair ${req.params.affairNumber} deleted`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while deleting affair: ${error}`,
    });
  }
}

/**
 * This function retrieves unresolved affairs that are older than six months and sends them as a
 * response in a JSON format.
 */
async function getOldUnresolvedAffairs(req, res) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const collection = db.collection("affairs");

    const query = await collection
      .find({
        statut: { $ne: "résolu" },
        createdAt: { $lte: sixMonthsAgo },
      })
      .toArray();

    res.status(200).json({
      success: true,
      message: "Affaires non résolues depuis plus de 6 mois",
      data: query,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération des affaires non résolues : ${error}`,
    });
  }
}

/**
 * The function `countAffairsByType` retrieves the count of affairs grouped by type from a MongoDB
 * collection and sends the results as a JSON response.
 */
async function countAffairsByType(req, res) {
  try {
    const collection = db.collection("affairs");
    const results = await collection
      .aggregate([
        {
          $group: {
            _id: "$type",
            total: { $sum: 1 },
          },
        },
        {
          $sort: { total: -1 },
        },
      ])
      .toArray();

    res.status(200).json({
      success: true,
      message: "Nombre d'affaires par type",
      data: results,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while counting affairs by type: ${error}`,
    });
  }
}

module.exports = {
  createAffairs,
  getAllAffairs,
  getByAffairNumber,
  updateAffair,
  deleteByAffairNumber,
  getOldUnresolvedAffairs,
  countAffairsByType,
};
