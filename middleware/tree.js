const Category = require('../models/CategoryModel')
const Valid = require('../helpers/validation')


exports.tree = async (id, catData) => {   
    if (id) {
        await Category.findOne({_id: id})
            .then(data => {
                if (data !== null) {
                    if (data.type === 'Super Category') {
                        catData.type = 'Category'
                        // console.log(catData);
                        return catData
                        // SubCategory(catData)
                    }
                } else {
                    catData.type = 'subCategory'
                    return catData
                }  
            })
    }
}