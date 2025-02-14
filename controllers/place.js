const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");

let db;
(async () => {
  db = await connectMongo.connectMongo();
})();

async function createPlaces(req, res) {
  try {
    const uniqueId = ID.generate(new Date().toJSON());

    await db.collection("places").insertOne({
      placeNumber: uniqueId,
      address: req.body.address,
      description: req.body.description,
      kind: req.body.kind,
    });

    res.status(200).json({ success: true, message: "Add a new place" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: `Error present when adding: ${error}` });
  }
}

async function getAllPlaces(req, res) {
  try {
    // TODO: add relations
    const query = await db.places.find();
    res.status(200).json({ success: true, message: "all places", data: query });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when getting: ${error}`,
    });
  }
}

async function getByAddress(req, res) {
  try {
    // TODO: add relations
    const query = await db.places.find({ address: req.body.address });

    if (query === null) {
      res.status(404).json({
        success: false,
        message: `place ${req.params.address} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `place ${req.params.address} recovers`,
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

async function getByPlaceNumber(req, res) {
  try {
    // TODO: add relations
    const query = await db.places.find({
      placeNumber: req.params.placeNumber,
    });
    if (query === null) {
      res.status(404).json({
        success: false,
        message: `place ${req.params.placeNumber} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `place ${req.params.placeNumber} recovers`,
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

async function upadetePlace(req, res) {
  try {
    const search = await db.places.find({
      placeNumber: req.params.placeNumber,
    });

    if (search === null) {
      res.status(404).json({
        success: false,
        message: `place ${req.params.placeNumber} not found`,
      });
    } else {
      await db.places.updateOne(
        { placeNumber: req.params.placeNumber },
        {
          $set: {
            address: req.body.address,
            description: req.body.description,
            kind: req.body.kind,
          },
        }
      );

      res.status(200).json({ success: true, message: "update an place" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when updating: ${error}`,
    });
  }
}

async function deleteByPlaceNumber(req, res) {
  try {
    const search = await db.places.find({
      placeNumber: req.params.placeNumber,
    });

    if (search === null) {
      res.status(404).json({
        success: false,
        message: `place ${req.params.placeNumber} not found`,
      });
    } else {
      const query = await db.places.deleteOne({
        placeNumber: req.params.placeNumber,
      });
      res.status(200).json({
        success: true,
        message: `place ${req.params.placeNumber} recovers`,
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
  createPlaces,
  getAllPlaces,
  getByAddress,
  getByPlaceNumber,
  upadetePlace,
  deleteByPlaceNumber,
};
