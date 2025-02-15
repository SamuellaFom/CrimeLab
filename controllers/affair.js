const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");

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

    res.status(200).json({ success: true, message: "Add a new affair" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: `Error present when adding: ${error}` });
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

    res
      .status(200)
      .json({ success: true, message: "all affairs", data: query });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when getting: ${error}`,
    });
  }
}

async function getByTitle(req, res) {
  try {
    // TODO: add relations
    const collection = db.collection("affairs"); 
    const query = await collection.find({ title: req.params.title });
    if (search === null) {
      res.status(404).json({
        success: false,
        message: `affair ${req.params.title} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `affair ${req.params.title} recovers`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when getting: ${error}`,
    });
  }
}

async function getByAffairNumber(req, res) {
  try {
    // TODO: add relations
    const collection = db.collection("affairs"); 
    const query = await collection.find({
      affairNumber: req.params.affairNumber,
    });
    if (search === null) {
      res.status(404).json({
        success: false,
        message: `affair ${req.params.affairNumber} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `affair ${req.params.affairNumber} recovers`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when getting: ${error}`,
    });
  }
}

async function upadeteAffair(req, res) {
  try {
    const collection = db.collection("affairs"); 
    const search = await collection.find({
      affairNumber: req.params.affairNumber,
    });

    if (search === null) {
      res.status(404).json({
        success: false,
        message: `affair ${req.params.affairNumber} not found`,
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

      res.status(200).json({ success: true, message: "update an affair" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when updating: ${error}`,
    });
  }
}

async function deleteByAffairNumber(req, res) {
  try {
    const collection = db.collection("affairs"); 
    const search = await collection.find({
      affairNumber: req.params.affairNumber,
    });

    if (search === null) {
      res.status(404).json({
        success: false,
        message: `affair ${req.params.affairNumber} not found`,
      });
    } else {
      const query = await collection.deleteOne({
        affairNumber: req.params.affairNumber,
      });
      res.status(200).json({
        success: true,
        message: `affair ${req.params.affairNumber} recovers`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when deleting: ${error}`,
    });
  }
}

module.exports = {
  createAffairs,
  getAllAffairs,
  getByTitle,
  getByAffairNumber,
  upadeteAffair,
  deleteByAffairNumber,
};
