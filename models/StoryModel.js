const mongoose = require('mongoose')
const db = require('../lib/db_connect')
const Category = require('./CategoryModel');


const Schema = mongoose.Schema;

const today = new Date();
const dataFormat = today.toISOString()

const storySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    likes: [
        {
            userId: String
        }
    ],
    likesCount: {
        type: Number,
        default: 0
    },
    comments: [
        {
            text: String,
            user: Schema.Types.ObjectId,
            userId: String
        },
    ],
    commentsCount: {
        type: Number,
        default: 0
    },
    seen: {
        type: Number,
        default: 0,
    },
    articleURL: {
        type: String,
        default: null
    },
    date: {
        type: String,
        default: dataFormat
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    },
    publisher: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    publisherRole: {
        type: String,
        required: true
    },
    imagePreview: {
        type: String,
        required: true
    },
    pages: [
        {
            name: String,
            types: String,
            link: String,
            duration: {
                type: Number,
                default: 0
            }
        },
    ],
    text: {
        type: String,
        default: ''
    },
    source: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        required: true
    }
})




module.exports = Story = db.model("stories", storySchema);
