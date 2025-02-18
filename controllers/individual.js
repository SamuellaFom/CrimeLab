const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");
const dbNeo4j = require("../config/database");

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

    const query = `
      CREATE (i:Individual
      {individualNumber: $individualNumber, name: $name, kind: $kind, 
      address: $address, phone: $phone})
      `;

    const params = {
      individualNumber: uniqueId,
      name: req.body.name,
      kind: req.body.kind,
      address: req.body.address,
      phone: req.body.phone,
    };

    try {
      await dbNeo4j.dbNeo4j.run(query, params);
    } catch (err) {
      console.error("Error running Neo4j query", err);
    }

    res.status(200).json({ success: true, message: "Added a new individual", individualNumber: uniqueId });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while adding: ${error}`,
    });
  }
}

async function getAllIndividuals(req, res) {
  try {
    const collection = db.collection("individuals");
    const query = await collection.find().toArray();

    res
      .status(200)
      .json({ success: true, message: "All individuals", data: query });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while getting individuals: ${error}`,
    });
  }
}

async function getByIndividualNumber(req, res) {
  try {
    const collection = db.collection("individuals");
    const query = await collection
      .aggregate([
        {
          $match: { individualNumber: req.params.individualNumber },
        },
        {
          $lookup: {
            from: "testimonials",
            localField: "individualNumber",
            foreignField: "individualNumber",
            as: "testimonials",
          },
        },
        { $unwind: "$testimonials" },
        {
          $lookup: {
            from: "affairs",
            localField: "testimonials.affairNumber",
            foreignField: "affairNumber",
            as: "affairs",
          },
        },
      ])
      .toArray();

    if (query.length === 0) {
      res.status(404).json({
        success: false,
        message: `Individual ${req.params.individualNumber} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `Individual ${req.params.individualNumber} found`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while getting individual: ${error}`,
    });
  }
}

async function updateIndividual(req, res) {
  try {
    const collection = db.collection("individuals");
    const search = await collection
      .find({ individualNumber: req.params.individualNumber })
      .toArray();

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Individual ${req.params.individualNumber} not found`,
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

      res
        .status(200)
        .json({ success: true, message: "Updated the individual" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while updating individual: ${error}`,
    });
  }
}

async function deleteByIndividualNumber(req, res) {
  try {
    const collection = db.collection("individuals");
    const search = await collection
      .find({ individualNumber: req.params.individualNumber })
      .toArray();

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Individual ${req.params.individualNumber} not found`,
      });
    } else {
      const query = await collection.deleteOne({
        individualNumber: req.params.individualNumber,
      });
      res.status(200).json({
        success: true,
        message: `Individual ${req.params.individualNumber} deleted`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while deleting individual: ${error}`,
    });
  }
}


async function getCompleteIndividualInfo(req, res) {
  try {
    const collection = db.collection("individuals");
    const data = await collection.aggregate([
      {
        $match: { individualNumber: req.params.individualNumber }
      },
      {
        $lookup: {
          from: "testimonials",
          localField: "individualNumber",
          foreignField: "individualNumber",
          as: "testimonials"
        }
      },
      {
        $lookup: {
          from: "affairs",
          localField: "testimonials.affairNumber",
          foreignField: "affairNumber",
          as: "affairs"
        }
      }
    ]).toArray();

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Individual ${req.params.individualNumber} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: `Complete information for individual ${req.params.individualNumber}`,
      data: data[0] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: `Error occurred while fetching individual info: ${error}`
    });
  }
}

// test 
async function getIndividualsMultipleAffairs(req, res) {
  try {
   
    const aggregationResult = await db.collection("testimonials").aggregate([
      {
        $group: {
          _id: "$individualNumber",
          affairNumbers: { $addToSet: "$affairNumber" }
        }
      },
      {
        $project: {
          individualNumber: "$_id",
          affairCount: { $size: "$affairNumbers" }
        }
      },
      {
        $match: {
          affairCount: { $gt: 1 }
        }
      }
    ]).toArray();

    const individualNumbers = aggregationResult.map(item => item.individualNumber);

    const individuals = await db.collection("individuals").find({
      individualNumber: { $in: individualNumbers }
    }).toArray();

    res.status(200).json({
      success: true,
      message: "Individus ayant participé à plus d'une affaire",
      data: individuals
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des individus:", error);
    res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération des individus: ${error}`
    });
  }
}



module.exports = {
  createIndividuals,
  getAllIndividuals,
  getByIndividualNumber,
  updateIndividual,
  deleteByIndividualNumber,
  getCompleteIndividualInfo,
  getIndividualsMultipleAffairs 
};
