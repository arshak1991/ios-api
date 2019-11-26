const mongoose = require('mongoose')
const db = require('../lib/db_connect')


const Schema = mongoose.Schema;

const followersSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    follower_id: {
        type: String,
        required: true
    }
})

module.exports = Follower = db.model("followers", followersSchema);