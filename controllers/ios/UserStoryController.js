const Story = require('../../models/StoryModel')
const Comments = require('../../models/StoryModel')
const User = require('../../models/UserModels')
const Category = require('../../models/CategoryModel')
const Control = require('../StoryController')
const Valid = require('../../helpers/validation')
const { getVideoDurationInSeconds } = require('get-video-duration')
const fs = require('fs')
const videoPath = './uploads/videos'
const imagePath = './uploads/images'
const imgPreview = './uploads/imgPreviews'

const CategoryHelper = require('../../helpers/category')

function deleteFile (file) { 
    fs.unlink(file, function (err) {
        if (err) {
            console.error(err.toString());
        } else {
            console.warn(file + ' deleted');
        }
    });
}

exports.create = async (req, res, next) => {
    await User.findOne({_id: req.user.id}).populate("profession").then(data => {
        Category.findOne({}, {categories: {$elemMatch: {_id: req.body.category}}})
            .then(docs => {
                CategoryHelper(docs.id).then(cat => {
                    if (cat.title == 'Social') {
                        Control.create(req, res, next)
                    }
                })
                if (docs.id == data.profession.category) {
                    Control.create(req, res, next)
                } else {
                    req.files.forEach(file => {
                        if (file.fieldname == "imagePreview") {
                            deleteFile(imgPreview+'/'+file.filename);
                        } else if (file.fieldname == "file") {
                            if (file.mimetype == "video/mp4") {
                                deleteFile(videoPath + '/' + file.filename)
                            } else {
                                deleteFile(imagePath + '/' + file.filename)
                            }
                        }
                    });
                    const error = new Error("You can't add Story by this Category") 
                    error.status = 504
                    next(error)
                }
            })
            .catch(err => {
                next(new Error(err))
            })  
    }).catch(err => {
        next(new Error(err))
    })
}

exports.getStories = async (req, res, next) => {
    const stories = await Story.find({}).populate("publisher").then(docs => {
        return  docs.filter(story => story.status == 'activated')
    }).catch(err => {
        next(new Error(err))
    })

    res.json({
        stories,
        count: stories.length
    })
}

exports.getStory = (req, res, next) => {
    Story.findOne({_id: req.params.id}).populate("publisher", "name surname")
        .then(docs => {
            res.json({
                story: docs,
                likesCount: docs.likes.length,
                commentsCount: docs.comments.length
            })
        })
    .catch(err => {
        const error = new Error(err)
        error.message = "such Story doesn't exist"
        next(error)
    })
}


exports.UpdateStory = (req, res, next) => {
    const storyData = {
        title: req.body.title,
        text: req.body.text
    }
    
    if(req.data.publisher.id == req.user.id) {
        Story.findOneAndUpdate({_id: req.params.id}, storyData, {new: true})
            .populate("publisher").then(story => {
                res.json({
                    story
                })
            })
    } else {
        res.json({
            success: false,
            message: "You can't change data this Story"
        })
    }
}

exports.deleteStory = (req, res, next) => {
    
    if (req.data.publisher.id == req.user.id) {
        Story.findOneAndDelete({_id: req.params.id}, (docs) => {
            res.json({
                success: true,
                message: "Story successfully deleted!!"
            })
        })
    } else {
        res.json({
            success: false,
            message: "You can't delete this Story"
        })
    }
    
}

exports.createComment = (req, res, next) => {
    const comments = req.body
    comments.userId = req.user._id
    
    Story.findOneAndUpdate({ _id: req.params.id }, {
        $push: { comments: comments},
        $inc: {commentsCount: 1}
    }, {new: true}).then(data => {
        return res.json({
            result: data,
            message: 'Comment for Story successfully added',
            success: true
        })
    }).catch(err => {
        res.status(400).json({
            err: err
        })
    })
}

exports.createLike = (req, res, next) => {
    const like = {}
    like.userId = req.user._id

    if (req.likes.length == 0) {
        Story.findOneAndUpdate({_id: req.params.id}, {
            $push: {likes: like},
            $inc: {likesCount: 1}
        }, {new: true}, (err, data) => {
            if(err) res.status(401).json({
                err: err
            })
            res.status(200).json({
                result: data,
                message: 'Like for this Story successfully added',
                success: true
            })
        })
    } else {
        Story.findOneAndUpdate({_id: req.params.id}, {
            $pull: {likes: like},
            $inc: {likesCount: -1}
        }, {new: true, safe: true, upsert: true}, (err, data) => {
            if (err) {
                res.status(401).json({
                    err: err
                })
            } else {
                res.status(200).json({
                    result: data,
                    message: "Like for this Story removed",
                    success: true
                })
            }
        })
    }
}

exports.addSeen = (req, res, next) => {
    let count = req.data.seen + 1
    
    Story.findOneAndUpdate({_id: req.params.id}, {seen: count}, {new: true}, (err, data) => {
        if (err) {
            res.status(401).json({
                err: err
            })
        } else {
            res.status(200).json({
                result: data,
                message: `This Story seen ${count} times`,
                count: count,
                success: true
            })
        }
    })
}

exports.StoryByCategory = (req, res, next) => {
    let flag = true
    
    if (flag) {
        Story.find({
            category: req.params.categoryId,
            status: 'activated'
        }, (err, data) => {
            if (err) {
                const error = new Error("such Story doesn't exist")
                next(error)
            }
            res.json({
                data: data,
                success: true,
                count: data.length
            })
        })
    } else {
        const error = new Error("such Category not your favourite")
        next(error)
    }
}

exports.StoryByFawCategory = (req, res, next) => {
    const categories = req.user.favouriteCategories
    let flag = false
    
    categories.forEach(element => {
        
        if (element._id == req.params.categoryId) {
            flag = true
        }
    });
    if (flag) {
        Story.find({
            category: req.params.categoryId,
            status: 'activated'
        }, (err, data) => {
            if (err) {
                const error = new Error("such Story doesn't exist")
                next(error)
            }
            res.json({
                data: data,
                success: true,
                count: data.length
            })
        })
    } else {
        const error = new Error("such Category not your favourite")
        next(error)
    }
}