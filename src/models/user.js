const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    userName: { type: String, required: true },
    password: { type: String, required: true },
    address: { type: String, required: false },
    privateKey: { type: String, required: false },
  },
  { timestamps: true }
);

const User = model("user", UserSchema);
module.exports = { User };
