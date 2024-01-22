require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const port = 3000;

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const contactSchema = new mongoose.Schema({
  Firstname: String,
  Lastname: String,
  Email: String,
  age: Number,
});

const Contact = mongoose.model("Contact", contactSchema);

app.get("/contacts", async function (req, res) {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/contact/:id", async function (req, res) {
  try {
    const contact = await Contact.findById(req.params.id);
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ error: "Contact not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/contacts/age/:minAge", async function (req, res) {
  try {
    const minAge = parseInt(req.params.minAge);
    const contacts = await Contact.find({ age: { $gt: minAge } });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/contacts/age18/nameContainsAh", async function (req, res) {
  try {
    const contacts = await Contact.find({
      age: { $gt: 18 },
      Lastname: { $regex: /ah/i },
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/contact/:id", async function (req, res) {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (updatedContact) {
      res.json(updatedContact);
    } else {
      res.status(404).json({ error: "Contact not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/contacts/age/:maxAge", async function (req, res) {
  try {
    const maxAge = parseInt(req.params.maxAge);
    const deletedContacts = await Contact.deleteMany({ age: { $lt: maxAge } });
    res.json({ message: "Contacts deleted successfully", deletedContacts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
