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

    res.status(200).json({ success: true, message: "Added a new place" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while adding: ${error}` });
  }
}

async function getAllPlaces(req, res) {
  try {
    const collection = db.collection("places"); 
    const query = await collection.find().toArray(); 

    res.status(200).json({ success: true, message: "All places", data: query });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while getting places: ${error}` });
  }
}

async function getByAddress(req, res) {
  try {
    const collection = db.collection("places");
    const query = await collection.find({ address: req.body.address }).toArray(); 

    if (query.length === 0) {
      res.status(404).json({ success: false, message: `Place with address ${req.body.address} not found` });
    } else {
      res.status(200).json({
        success: true,
        message: `Place with address ${req.body.address} found`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while getting place: ${error}` });
  }
}

async function getByPlaceNumber(req, res) {
  try {
    const collection = db.collection("places");
    const query = await collection.aggregate([
      { $match: { placeNumber: req.params.placeNumber } },
      {
        $lookup: {
          from: "affairs",             // collection à joindre
          localField: "affairs",        // champ dans la collection "places" (qui contient les références)
          foreignField: "affairNumber", // champ correspondant dans "affairs"
          as: "affairDetails"           // nouveau champ qui contiendra les détails des affaires
        }
      }
    ]).toArray();

    if (query.length === 0) {
      res.status(404).json({
        success: false,
        message: `Place with placeNumber ${req.params.placeNumber} not found`
      });
    } else {
      res.status(200).json({
        success: true,
        message: `Place with placeNumber ${req.params.placeNumber} found`,
        data: query
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while getting place: ${error}`
    });
  }
}


async function updatePlace(req, res) {  
  try {
    const collection = db.collection("places");
    const search = await collection.find({ placeNumber: req.params.placeNumber }).toArray(); 

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
    res.status(500).json({ success: false, message: `Error occurred while updating place: ${error}` });
  }
}

async function deleteByPlaceNumber(req, res) {
  try {
    const collection = db.collection("places");
    const search = await collection.find({ placeNumber: req.params.placeNumber }).toArray(); 

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Place with placeNumber ${req.params.placeNumber} not found`,
      });
    } else {
      const query = await collection.deleteOne({ placeNumber: req.params.placeNumber });
      res.status(200).json({
        success: true,
        message: `Place with placeNumber ${req.params.placeNumber} deleted`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while deleting place: ${error}` });
  }
}

module.exports = {
  createPlaces,
  getAllPlaces,
  getByAddress,
  getByPlaceNumber,
  updatePlace, 
  deleteByPlaceNumber,
};
