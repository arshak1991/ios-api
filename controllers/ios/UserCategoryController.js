const Category = require('../../models/CategoryModel')
const Control = require('../CategoryController')

exports.getCategories = (req, res, next) => {
    Control.getCategories(req, res, next)
}

