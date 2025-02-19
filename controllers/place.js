const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");

let db;
(async () => {
  db = await connectMongo.connectMongo();
})();

/**
 * The function `createPlaces` asynchronously adds a new place to a database collection with unique ID
 * and returns a success message with the place number.
 */

async function createPlaces(req, res) {
  try {
    const uniqueId = ID.generate(new Date().toJSON());

    await db.collection("places").insertOne({
      placeNumber: uniqueId,
      address: req.body.address,
      description: req.body.description,
      kind: req.body.kind,
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Added a new place",
        placeNumber: uniqueId,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: `Error occurred while adding: ${error}`,
      });
  }
}

/**
 * The function `getAllPlaces` retrieves all places from a collection in a database and sends a JSON
 * response with the data or an error message.
 */
async function getAllPlaces(req, res) {
  try {
    const collection = db.collection("places");
    const query = await collection.find().toArray();

    res.status(200).json({ success: true, message: "All places", data: query });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: `Error occurred while getting places: ${error}`,
      });
  }
}

/**
 * The function getByPlaceNumber retrieves a place from a collection based on the place number provided
 * in the request parameters and returns a success message with the data if found, or a failure message
 * if not found.
 */
async function getByPlaceNumber(req, res) {
  try {
    const collection = db.collection("places");
    const query = await collection
      .find({ placeNumber: req.params.placeNumber })
      .toArray();

    if (query.length === 0) {
      res.status(404).json({
        success: false,
        message: `Place with placeNumber ${req.params.placeNumber} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `Place with placeNumber ${req.params.placeNumber} found`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: `Error occurred while getting place: ${error}`,
      });
  }
}

/**
 * The function `updatePlace` updates a place in a collection based on the provided placeNumber in a
 * MongoDB database and returns a success message if the update is successful.
 */
async function updatePlace(req, res) {
  try {
    const collection = db.collection("places");
    const search = await collection
      .find({ placeNumber: req.params.placeNumber })
      .toArray();

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Place with placeNumber ${req.params.placeNumber} not found`,
      });
    } else {
      await collection.updateOne(
        { placeNumber: req.params.placeNumber },
        {
          $set: {
            address: req.body.address,
            description: req.body.description,
            kind: req.body.kind,
          },
        }
      );

      res.status(200).json({ success: true, message: "Updated the place" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: `Error occurred while updating place: ${error}`,
      });
  }
}

/**
 * The function `deleteByPlaceNumber` deletes a place from a collection based on its place number and
 * returns a success message or an error message.
 */
async function deleteByPlaceNumber(req, res) {
  try {
    const collection = db.collection("places");
    const search = await collection
      .find({ placeNumber: req.params.placeNumber })
      .toArray();

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Place with placeNumber ${req.params.placeNumber} not found`,
      });
    } else {
      const query = await collection.deleteOne({
        placeNumber: req.params.placeNumber,
      });
      res.status(200).json({
        success: true,
        message: `Place with placeNumber ${req.params.placeNumber} deleted`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: `Error occurred while deleting place: ${error}`,
      });
  }
}

module.exports = {
  createPlaces,
  getAllPlaces,
  getByPlaceNumber,
  updatePlace,
  deleteByPlaceNumber,
};
