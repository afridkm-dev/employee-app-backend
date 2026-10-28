const mongoose = require('mongoose');
const { app } = require('./app');

const port = Number(process.env.PORT) || 10000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI is required');
}

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Employee API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to MongoDB', error);
    process.exit(1);
  });
