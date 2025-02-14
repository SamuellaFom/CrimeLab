const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");
const db = await connectMongo();

async function createAffairs(req, res) {
  try {
    const uniqueId = ID.generate(new Date().toJSON());

    await db.collection("affairs").insertOne({
      affairNumber: uniqueId,
      title: req.body.title,
      description: req.body.description,
      statut: req.body.statut,
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
    // TODO: add relations
    const query = await db.affairs.find();
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
    const query = await db.affairs.find({ title: req.params.title });
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
    const query = await db.affairs.find({
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
    const search = await db.affairs.find({
      affairNumber: req.params.affairNumber,
    });

    if (search === null) {
      res.status(404).json({
        success: false,
        message: `affair ${req.params.affairNumber} not found`,
      });
    } else {
      await db.affairs.updateOne(
        { affairNumber: req.params.affairNumber },
        {
          $set: {
            title: req.body.title,
            description: req.body.description,
            statut: req.body.statut,
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
    const search = await db.affairs.find({
      affairNumber: req.params.affairNumber,
    });

    if (search === null) {
      res.status(404).json({
        success: false,
        message: `affair ${req.params.affairNumber} not found`,
      });
    } else {
      const query = await db.affairs.deleteOne({
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
