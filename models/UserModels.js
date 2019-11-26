const mongoose = require('mongoose')
const db = require('../lib/db_connect')
const types = require('../constants/roles')


const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60,
    },
    surname: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60,
    },
    email: {
        type: String,
        email: true,
        unique: true,
        required: true,
    },
    avatar: {
        type: String,
        default: `${process.env.SERVER_URL}/default/users.jpg`,
    },
    favouriteCategories: [
        {
            type: Object,
            ref: 'categories'
        }
    ],
    role: {
        type: String,
        enum: Object.values(types),
        default: types.USER,
    },
    profession: {
        type: Schema.Types.ObjectId,
        ref: 'professions',
        default: null
    },
    password: {
        type: String,
        required: true,
    }
})

module.exports = Users = db.model("users", userSchema);
