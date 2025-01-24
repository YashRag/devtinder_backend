const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://yashvanths2016:tONPqNKeiNmUXXTG@namastenode.6rzm2.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
