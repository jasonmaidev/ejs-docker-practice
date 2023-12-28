const sharp = require('sharp');
const multer = require('multer');
const path = require('path');

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function ourCleanup(req, res, next) {
  if (typeof req.body.name != "string") req.body.name = ""
  if (typeof req.body.species != "string") req.body.species = ""
  if (typeof req.body._id != "string") req.body._id = ""

  req.cleanData = {
    name: sanitizeHTML(req.body.name.trim(), { allowedTags: [], allowedAttributes: {} }),
    species: sanitizeHTML(req.body.species.trim(), { allowedTags: [], allowedAttributes: {} })
  }

  next()
}

app.post("/create-animal", upload.single("photo"), ourCleanup, async (req, res) => {
  if (req.file) {
    const photofilename = `${Date.now()}.jpg`
    await sharp(req.file.buffer)
      .resize(844, 456)
      .jpeg({ quality: 60 })
      .toFile(path.join("public", "uploaded-photos", photofilename))
    req.cleanData.photo = photofilename
  }

  console.log(req.body)
  const info = await db.collection("animals").insertOne(req.cleanData)
  const newAnimal = await db.collection("animals").findOne({ _id: new ObjectId(info.insertedId) })
  res.send(newAnimal)
})
