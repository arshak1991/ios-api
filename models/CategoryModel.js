const mongoose = require('mongoose')
const db = require('../lib/db_connect')


const Schema = mongoose.Schema;
const today = new Date();
const dataFormat = today.toISOString();

const categorySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    categories: [
        {
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            parent_id: {
                type: Schema.Types.ObjectId,
                ref: "categories",
                default: null,
            },
            type: {
                type: String,
                default: 'Category'
            },
            subCategories: [{
                title: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                },
                parent_id: {
                    type: Schema.Types.ObjectId,
                    ref: "categories",
                    default: null,
                },
                type: {
                    type: String,
                    default: 'SubCategory'
                },
                create_date: {
                    type: String,
                    default: dataFormat
                }
            }],
            create_date: {
                type: String,
                default: dataFormat
            }
        },
    ],
    type: {
        type: String,
        default: 'Super Category'
    },
    create_date: {
        type: String,
        default: dataFormat
    }
})

module.exports = Category = db.model("categories", categorySchema);
