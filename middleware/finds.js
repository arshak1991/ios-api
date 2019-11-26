const Story = require('../models/StoryModel')
const Categories = require('../models/CategoryModel')
const Users = require('../models/UserModels')


exports.find = (req, res, next) => {
    Story.findOne({_id: req.params.id}).populate("publisherId").then(story => {        
        if (story) {
            req.data = story
            next()
        } else {
            next(new Error(err))
        }
    })
}

exports.findLike = (req, res, next) => {
    Story.findOne({_id: req.params.id}, (err, docs) => {
        req.likes = docs.likes.filter(like => like.userId == req.user._id);
        next()
    })
}

exports.findCategories = (req, res, next) => {
    Categories.find({}, (err, docs) => {
        let arr = []
        docs.filter((el) => {
            arr.push(el)
        })
        req.categories = arr
        next()
    })
}

exports.findUserCategories = (req, res, next) => {
    let existArr = []
    Users.findOne({_id: req.user._id}, (err, docs) => {
        docs.favouriteCategories.forEach(element => {
            if (req.body.categories.includes(element.title)) {
                existArr.push({
                    category: element.title
                })
            }
        });
        if (existArr.length) {
            const error = new Error("This Categories already your Favourite")
            error.status = 406
            next(error)
        }else {
            next()
        }
    })
}

exports.findRole = (req, res, next) => {
    const role = req.body.role
    if (role) {
        const error = new Error("You can't create these User")
        error.status = 402
        next(error)
    } else {
        next()
    }
}

exports.findUserByEmail = (req, res, next) => {
    const email = req.body.email

    Users.findOne({ 
        email: email,
        role: "USER"
    }, (err, data) => {
        if (!data) {
            const error = new Error("Such Email not registered as a User!!!")
            error.status = 502
            next(error)
        } else {
            next()
        }
    })
}