const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL, {
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

    module.exports = mongoose;