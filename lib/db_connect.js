const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp', {
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

    module.exports = mongoose;