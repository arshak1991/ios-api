const mongoose = require('mongoose')
const db = require('../lib/db_connect')


const Schema = mongoose.Schema;

const professionSchema = new Schema({
    title: {
        type: String,
        minlength: 4,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    }
})

module.exports = Profession = db.model("professions", professionSchema);