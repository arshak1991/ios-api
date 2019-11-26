const Category = require('../models/CategoryModel')
const Valid = require('../helpers/validation')
const { tree } = require('../middleware/tree')

const CategoryHelper = require('./../helpers/category');

function createSuperCategory(res, next, data) {
    Category.create(data)
        .then(category => {
            res.json({
                success: true,
                title: category.title,
                description: category.description
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.status = 403
            error.success = false
            next(error)
        })
}
function createCategory(res, next, data) {
    Category.findOneAndUpdate({_id: data.parent_id}, {
        $push: {categories: data}
    }, {new: true}).then(docs => {
        res.json({
            success: true,
            title: docs.title,
            description: docs.description
        })
    })
}

function createSubCategory(res, next, data) {
    Category.update({
        categories: {
            $elemMatch: {
                _id: data.parent_id
            }
        }
    }, {
        $push: {
            'categories.$.subCategories': data
        }
    }, {new: true}).then(docs => {
        res.json({
            success: true,
            title: docs.title,
            description: docs.description
        })
    })
} 

exports.create = async (req, res, next) => {
    const validation = Valid.catValidation(req.body)
    if (!validation.validationType) {
        res.status(400).json({
            type: "error",
            messages: validation.messages
        })
        return;
    }
    
    const catData = {
        title: req.body.title,
        description: req.body.description,
        parent_id: req.body.parent_id
    }
    
    tree(req.body.parent_id, catData).then(() => {
        console.log(catData);
        switch (catData.type) {
            case 'Category':
                createCategory(res, next, catData)
                break;
            case 'subCategory':
                createSubCategory(res, next, catData)
                break;
            default:
                createSuperCategory(res, next, catData)
                break;
        }
    })
}

exports.getCategories = (req, res, next) => {

    Category.find({}).populate("parent_id")
        .then((categories) => {
            res.json({AllCategories: categories})
        })
}

exports.getCategory = (req, res, next) => {
    CategoryHelper(req.params.id).then(docs => {
        res.json({
            category: docs
        })
    }).catch(err => {
        next(new Error("Such Category doesn't exist"))
    })
}

exports.updateCategory = (req, res, next) => {
    const validation = Valid.catValidation(req.body)
    if (!validation.validationType) {
        res.status(400).json({ type: "error", messages: validation.messages })
        return;
    }
    const categoryId = req.body.id
    const categoryData = {
        title: req.body.title,
        description: req.body.description
    }
    CategoryHelper(categoryId).then(data => {
        
        switch (data.type) {
            case 'Super Category':
                Category.findOneAndUpdate({_id: data._id}, categoryData, {new: true}, (err) => {
                    if (err) return res.status(500).json({err: err});
                    return res.status(201).json({
                        category_id: req.params.id,
                        message: 'Category successfully Updated',
                        success: true
                    });
                })
                break;
            case 'Category':
                Category.findOneAndUpdate(
                    { "categories._id": data._id },
                    {
                        $set: { 
                            'categories.$.title': categoryData.title,
                            'categories.$.description': categoryData.description
                        }
                    },
                    {new: true}
                ).then(data => {
                    res.json({
                        data: data,
                        success: true
                    })
                }).catch(err => res.status(500).json({err: err}))
                break;
            case 'subCategory':
                Category.findOne(
                    { 
                        "categories._id": data.parent_id,
                        "categories.subCategories._id": data._id
                    }                        
                ).then(category => {
                    const subCategories = category.categories[0].subCategories;
                    let subCategoryToEdit = null;
                    for (let i = 0; i < subCategories.length; i++) {
                        if (subCategories[i]._id.toString() == data._id) {
                            subCategoryToEdit = subCategories[i];
                            subCategories[i].title = categoryData.title;
                            subCategories[i].description = categoryData.description
                        }
                    }

                    category.save()
                        .then(result => res.json({
                            data: subCategoryToEdit,
                            success: true
                        }))
                        .catch(err => {throw err});                        
                }).catch(err => res.status(500).json({err: err}))
                break;
            default:
                res.json({
                    message: 'Such Category doesn\'t exist',
                    success: true
                })
                break;
        }
    })
}

exports.deleteCategory = (req, res, next) => {
    CategoryHelper(req.params.id).then(data => {
        switch (data.type) {
            case 'Super Category':
                Category.findOneAndRemove({_id: req.params.id}, (err) => {
                    if (err) return res.status(500).json({err: err});
                    return res.status(201).json({
                        category_id: req.params.id,
                        message: 'Category successfully Deleted',
                        success: true
                    });
                })
                break;
            case 'Category':
                Category.findOneAndUpdate(
                    {_id: data.parent_id},
                    { $pull: { categories: {_id: data._id} }},
                    {new: true}
                ).then(data => {
                    res.json({
                        data: data,
                        success: true
                    })
                }).catch(err => res.status(500).json({err: err}))
                break;
            case 'subCategory':
                Category.findOneAndUpdate(
                    {categories: {$elemMatch: {_id: data.parent_id}}},
                    { $pull: { 'categories.$.subCategories': {_id: data._id} }},
                    {new: true}
                ).then(data => {
                    res.json({
                        data: data,
                        success: true
                    })
                }).catch(err => res.status(500).json({err: err}))
                break;
            default:
                    res.json({
                        message: 'Such Category doesn\'t exist',
                        success: true
                    })
                break;
        }
    })
}
