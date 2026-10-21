const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Atlas Connesso!`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database attivo: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Errore di connessione: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;