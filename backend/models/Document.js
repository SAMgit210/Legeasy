import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  fileName: String,
  text: String,
  clauses: [
    {
      text: String,
      risk: String
    }
  ]
});

const Document = mongoose.model("Document", documentSchema);

export default Document;