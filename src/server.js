const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const lightwallet = require("eth-lightwallet");
const { User } = require("./models/user");
const e = require("express");

const MONGO_URL =
  "mongodb+srv://mongodb:<password>@mongodbtutorial.4wahk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const server = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Mongodb connected");

    app.get("/user", async (req, res) => {
      try {
        let { user, passwd } = req.body;
        const users = await User.findOne({ userName: user, password: passwd });
        return res.send({ users });
      } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
      }
    });

    app.post("/user", async (req, res) => {
      try {
        let { username, password } = req.body;
        let user = new User();
        let address, keystore;

        if (!username)
          return res.status(400).send({ err: "username is reuqired" });
        if (!password)
          return res.status(400).send({ err: "password is reuqired" });

        user.userName = username;
        user.password = password;

        const chkUser = await User.findOne({
          userName: username,
          password: password,
        });

        if (chkUser) {
          return res.send({ chkUser });
        } else {
          //mnemonic 생성
          let mnemonic = lightwallet.keystore.generateRandomSeed();

          //address, keystore 생성
          lightwallet.keystore.createVault(
            {
              password: password,
              seedPhrase: mnemonic,
              hdPathString: "m/0'/0'/0'",
            },
            (err, ks) => {
              ks.keyFromPassword(password, function (err, pwDerivedKey) {
                ks.generateNewAddress(pwDerivedKey, 1);

                address = ks.getAddresses().toString();
                keystore = ks.serialize();
                user.address = address;
                user.privateKey = keystore;
                user.save();
                return res.send({ address });
              });
            }
          );
        }
      } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
      }
    });

    app.listen(3000, () => {
      console.log("server listening on port 3000");
    });
  } catch (err) {
    console.log(err);
  }
};

server();
