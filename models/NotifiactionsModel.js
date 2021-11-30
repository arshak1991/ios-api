const mongoose = require('mongoose')
const db = require('../lib/db_connect')


const Schema = mongoose.Schema;

const today = new Date();
const dataFormat = today.toISOString()

const notifiactionsSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    linkedIn: {
        type: String,
        default: null
    },
    description: {
        type: String,
        required: true
    },
    links: {
        type: Array,
        required: true
    },
    profession: {
        type: Schema.Types.ObjectId,
        ref: 'professions',
        required: true
    },
    date: {
        type: String,
        default: dataFormat
    },
})

module.exports = Notifiaction = db.model("notifiactions", notifiactionsSchema);