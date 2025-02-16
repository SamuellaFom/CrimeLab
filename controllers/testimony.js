const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");

let db;
(async () => {
  db = await connectMongo.connectMongo();
})();

async function createTestimonials(req, res) {
  try {
    const uniqueId = ID.generate(new Date().toJSON());

    await db.collection("testimonials").insertOne({
      testimonyNumber: uniqueId,
      date: req.body.date,
      content: req.body.content,
      individualNumber: req.body.individualNumber,
      affairNumber: req.body.affairNumber,
    });

    res.status(200).json({ success: true, message: "Added a new testimony" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while adding: ${error}` });
  }
}

async function getAllTestimonials(req, res) {
  try {
    const collection = db.collection("testimonials"); 
    const query = await collection.find().toArray();  

    res.status(200).json({ success: true, message: "All testimonials", data: query });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while getting testimonials: ${error}` });
  }
}

async function getByTestimonyNumber(req, res) {
  try {
    const collection = db.collection("testimonials");
    const query = await collection.aggregate([
      {$match: {testimonyNumber: req.params.testimonyNumber}},

      {
        $lookup: {
          from: "individuals",
          localField: "individualNumber",
          foreignField: "individualNumber",
          as: "individualDetails",
        }
      },

      {
        $lookup: {
          from: "affairs",
          localField: "affairNumber",
          foreignField: "affairNumber",
          as: "affairDetails",
        }
      }

    ]).toArray();

    if (query.length === 0) {
      res.status(404).json({
        success: false,
        message: `Testimony with testimonyNumber ${req.params.testimonyNumber} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `Testimony with testimonyNumber ${req.params.testimonyNumber} found`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while getting testimony: ${error}` });
  }
}

async function updateTestimony(req, res) {  
  try {
    const collection = db.collection("testimonials");
    const search = await collection.find({ testimonyNumber: req.params.testimonyNumber }).toArray(); 

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Testimony with testimonyNumber ${req.params.testimonyNumber} not found`,
      });
    } else {
      await collection.updateOne(
        { testimonyNumber: req.params.testimonyNumber },
        {
          $set: {
            date: req.body.date,
            content: req.body.content,
            individualNumber: req.body.individualNumber,
            affairNumber: req.body.affairNumber,
          },
        }
      );

      res.status(200).json({ success: true, message: "Updated the testimony" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while updating testimony: ${error}` });
  }
}

async function deleteByTestimonyNumber(req, res) {
  try {
    const collection = db.collection("testimonials");
    const search = await collection.find({ testimonyNumber: req.params.testimonyNumber }).toArray(); 

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Testimony with testimonyNumber ${req.params.testimonyNumber} not found`,
      });
    } else {
      const query = await collection.deleteOne({ testimonyNumber: req.params.testimonyNumber });
      res.status(200).json({
        success: true,
        message: `Testimony with testimonyNumber ${req.params.testimonyNumber} deleted`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error occurred while deleting testimony: ${error}` });
  }
}

module.exports = {
  createTestimonials,
  getAllTestimonials,
  getByTestimonyNumber,
  updateTestimony,
  deleteByTestimonyNumber,
};
