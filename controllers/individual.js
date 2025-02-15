const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");

let db;
(async () => {
  db = await connectMongo.connectMongo();
})();

async function createIndividuals(req, res) {
  try {
    const uniqueId = ID.generate(new Date().toJSON());

    await db.collection("individuals").insertOne({
      individualNumber: uniqueId,
      name: req.body.name,
      kind: req.body.kind,
      address: req.body.address,
      phone: req.body.phone,
    });

    res.status(200).json({ success: true, message: "Add a new individual" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: `Error present when adding: ${error}` });
  }
}

async function getAllIndividuals(req, res) {
  try {
    // TODO: add relations
    const collection = db.collection("individuals"); 
    const query = await collection.find();
    res
      .status(200)
      .json({ success: true, message: "all individuals", data: query });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when getting: ${error}`,
    });
  }
}

async function getByIndividualNumber(req, res) {
  try {
    // TODO: add relations
    const collection = db.collection("individuals"); 
    const query = await collection.find({
      individualNumber: req.params.individualNumber,
    });
    if (query === null) {
      res.status(404).json({
        success: false,
        message: `individual ${req.params.individualNumber} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `individual ${req.params.individualNumber} recovers`,
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

async function upadeteIndividual(req, res) {
  try {
    const collection = db.collection("individuals"); 
    const search = await collection.find({
      individualNumber: req.params.individualNumber,
    });

    if (search === null) {
      res.status(404).json({
        success: false,
        message: `individual ${req.params.individualNumber} not found`,
      });
    } else {
      await collection.updateOne(
        { individualNumber: req.params.individualNumber },
        {
          $set: {
            name: req.body.name,
            kind: req.body.kind,
            address: req.body.address,
            phone: req.body.phone,
          },
        }
      );

      res.status(200).json({ success: true, message: "update an individual" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when updating: ${error}`,
    });
  }
}

async function deleteByIndividualNumber(req, res) {
  try {
    const collection = db.collection("individuals"); 
    const search = await collection.find({
      individualNumber: req.params.individualNumber,
    });

    if (search === null) {
      res.status(404).json({
        success: false,
        message: `individual ${req.params.individualNumber} not found`,
      });
    } else {
      const query = await collection.deleteOne({
        individualNumber: req.params.individualNumber,
      });
      res.status(200).json({
        success: true,
        message: `individual ${req.params.individualNumber} recovers`,
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
  createIndividuals,
  getAllIndividuals,
  getByIndividualNumber,
  upadeteIndividual,
  deleteByIndividualNumber,
};
