const mongoose = require('mongoose');
const Category = require('../models/CategoryModel');

module.exports = (categoryName) => {
    return new Promise(async (resolve, reject) => {
        try {
          const superCategory = await Category.findOne({ title: categoryName });
            if (superCategory) {
                resolve(superCategory);
            }

            const parentCategory = await Category.findOne({}, {'categories.$': 1})
                .elemMatch('categories', { title: categoryName })
            
           
            if (parentCategory) {
                resolve(parentCategory.categories[0]);
            } else {

                const categories = await Category.findOne({}, {"categories.subCategories.$": 1})
                    .elemMatch('categories.subCategories', { title: categoryName });

                if (categories) {
                   resolve(findCategoryInArray(categories.categories[0].subCategories, categoryName)); 
                } else {
                    throw new Error("Such Category doesn't exist")
                }
                
            }
        } catch (error) {
            console.log(error);
            reject(error)
        }
        
    })
    
};

function findCategoryInArray(categories, categoryName) {
    return categories.find(c => c.title.toString() == categoryName);
}