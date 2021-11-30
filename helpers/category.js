const mongoose = require('mongoose');
const Category = require('../models/CategoryModel');

module.exports = async (categoryId) => {
    const superCategory = await Category.findOne({ _id: categoryId });
    if (superCategory) {
        return superCategory;
    }

    const parentCategory = await Category.findOne({}, {'categories.$': 1})
        .elemMatch('categories', { _id: categoryId })

    if (parentCategory) {
        return parentCategory.categories[0];
    } else {
        const categories = await Category.findOne({}, {"categories.subCategories.$": 1})
            .elemMatch('categories.subCategories', { _id: categoryId });

        return findCategoryInArray(categories.categories[0].subCategories, categoryId);
    }
};

function findCategoryInArray(categories, categoryId) {
    return categories.find(c => c._id.toString() == categoryId);
}