const Story = require('../models/StoryModel')
const User = require('../models/UserModels')
const Comments = require('../models/StoryModel')
const Category = require('../models/CategoryModel')
const Valid = require('../helpers/validation')
const { getVideoDurationInSeconds } = require('get-video-duration')
const fs = require('fs')
const videoPath = './uploads/videos'
const imagePath = './uploads/images'
const imgPreview = './uploads/imgPreviews'
const URL = require('url').URL
const URLSearchParams = require('url').URLSearchParams

const CategoryHelper = require('./../helpers/category');

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
    const storyData = {
        title: req.body.title,
        text: req.body.text,
        source: req.body.source,
        publisher: req.user._id,
        category: req.body.category
    }
    if (req.body.link) {
        storyData.articleURL = req.body.link
        let url = new URL(req.body.link)
        let param = new URLSearchParams(url.search)
        v = param.get('v')
        storyData.imagePreview = `https://img.youtube.com/vi/${v}/hqdefault.jpg`
    }
    if (req.files.length) {
        req.files.forEach(file => {
            switch (file.fieldname) {
                case "file":
                    if (file && !req.body.link) {
                        let videoDuration;
                        let fileLink;
                        let path = file.path
                        storyData.pages = {
                            name: file.filename,
                            types: file.mimetype,
                        }
                        if (file.mimetype === 'video/mp4') {
                            getVideoDurationInSeconds(path).then((duration) => {
                                storyData.pages.duration = duration/60
                                storyData.pages.link = `${process.env.SERVER_URL}/uploads/videos/${file.filename}`
                            })
                        } else {
                            storyData.pages.duration = 0
                            storyData.pages.link = `${process.env.SERVER_URL}/uploads/images/${file.filename}`
                            storyData.imagePreview = `${process.env.SERVER_URL}/uploads/images/${file.filename}`
                        }
                        
                    } else if (!file && req.body.link) {
                        storyData.articleURL = req.body.link
                        let url = new URL(req.body.link)
                        let param = new URLSearchParams(url.search)
                        v = param.get('v')
                        storyData.imagePreview = `https://img.youtube.com/vi/${v}/hqdefault.jpg`
                    } else {
                        res.json({
                            success: false,
                            message: "you can create only link or file"
                        })
                    }
                    break;
                case "imagePreview":
                    if (file && file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
                        storyData.imagePreview = `${process.env.SERVER_URL}/uploads/imgPreviews/${file.filename}`
                        if (req.body.link) {
                            storyData.articleURL = req.body.link
                        }
                    }
                    break;
                default:
                    res.json({
                        success: false,
                        message: "with video add Image for preview"
                    })
                    break;
            }
        });
    }
    
    
    let status;
    let role;
    await User.findOne({_id: req.user._id})
        .then(user => {
            if (user.role === 'USER') {
                status = 'deactivated',
                role = user.role
            } else{
                status = 'activated'
                role = user.role
            }

        })
    storyData.status = status;
    storyData.publisherRole = role
    
    CategoryHelper(req.body.category)
        .then(cat => {
            if (cat) {
                if (!storyData.imagePreview) {
                    deleteFile(videoPath+'/'+storyData.pages.name);
                    let error = new Error("with video add Image for preview")
                    error.success = false
                    next(error)
                } else {
                    Story.create(storyData)
                        .then(story => {
                            res.json({
                                success: true,
                                story
                            })
                        })
                }
            } else {
                if (req.file.mimetype === 'image/png' || req.file.mimetype === 'image/jpg' || req.file.mimetype === 'image/jpeg') {
                    deleteFile(imagePath+'/'+storyData.pages.name);
                    let error = new Error("Such Category doesn't exist!!!!")
                    error.success = false
                    next(error)
                }
                else {
                    deleteFile(videoPath+'/'+storyData.pages.name);
                    let error = new Error("Such Category doesn't exist!!!!")
                    error.success = false
                    next(error)
                }
            }
        }).catch(err => {
            if (req.files.length) {
                if (storyData.pages.types === 'image/png' || storyData.pages.types === 'image/jpg' || storyData.pages.types === 'image/jpeg') {
                    deleteFile(imagePath+'/'+storyData.pages.name);
                }
                else {
                    deleteFile(videoPath+'/'+storyData.pages.name);
                }
                let error = new Error('such Category doesn\'t exist')
                error.success = false
                next(error)
            } else {
                let error = new Error(err)
                error.message = "send File or Image Preview"
                error.success = false
                next(error)
            }
            req.files.forEach(file => {
                if (file.fieldname == "imagePreview") {
                    deleteFile(imgPreview+'/'+file.filename);
                }
            });
        })
}

exports.getStories = async (req, res, next) => {
    Story.find({}).populate('publisher', 'name surname role avatar').lean()
    .then(async (datas) => {
        const categories = datas.map((data) => {
            return CategoryHelper(data.category).then(docs => {
                data.categoryName = docs.title;
                return data;
            })
        });

        const stories = await Promise.all(categories);

        res.json({
            stories,
            success: true
        })
    })
}

exports.getStory = (req, res, next) => {
    Story.findOne({_id: req.params.id})
        .then((story) => {
            let v;
            if (story.articleURL !== null) {
                let url = new URL(story.articleURL)
                let param = new URLSearchParams(url.search)
                v = param.get('v')
            }                
            Story.findOne({_id: req.params.id})
                .then((story) => {
                    CategoryHelper(story.category)
                        .then((category) => {
                            story.category = category;
                            res.json({
                                story,
                                v: v,
                                success: true});
                        })
                        .catch(err => {
                            next(new Error(err))
                        })
                })                    
        }).catch(error => {
            next(new Error(error))
        })
}

exports.createComment = (req, res, next) => {
    const comments = [req.body]
    
    Story.findOneAndUpdate({ _id: req.params.id }, {$push: { 
        comments: comments
    }}, {new: true}, 
        (err, data) => {
            if(err) return res.status(400).json({
                err: err
            })
            return res.json({
                result: data,
                message: 'Story successfully Updated',
                success: true
            })
        }
    )
}

exports.updateStory = (req, res, next) => {
    
    const storyId = req.body.id
    
    const storyData = {
        title: req.body.title,
        text: req.body.text
    }
    if (req.body.title !== '') {
        Story.findByIdAndUpdate(storyId, storyData, {new: true}, 
            (err, data) => {
                if (err) return res.status(400).json({
                    err: err,
                    success :false
                })
                return res.json({
                    result: data,
                    message: 'Story successfully Updated',
                    success: true
                })                
            }
        )
    } else {
        const error = new Error("story should have a Title")
        error.status = 402
        error.success = false
        next(error)
    }
}

exports.deleteStory = (req, res, next) => {
    Story.findOneAndRemove({_id: req.params.id}, (err, docs) => {
        if (err) return res.status(500).json({err: err});
        if (docs.pages[0]) {
           if (docs.pages[0].types === 'image/png' || docs.pages[0].types === 'image/jpg' || docs.pages[0].types === 'image/jpeg') {
                deleteFile(imagePath+'/'+docs.pages[0].name);
            } else {
                deleteFile(videoPath+'/'+docs.pages[0].name);
            } 
        }
        const fileUrl = new URL(docs.imagePreview).pathname
        deleteFile('.'+fileUrl)
        return res.status(201).json({
            story_id: req.params.id,
            message: 'Story successfully Deleted',
            success: true
        });
    })
}

exports.acceptStory = (req, res, next) => {
    Story.findOneAndUpdate({_id: req.params.id}, {$set: {status: 'activated'}}, (err, docs) => {
        if (err) {
            next(new Error("Story not activated"))
        }
        res.json({
            result: docs,
            success: true,
            message: "Story successfully Activated"
        })
    })
}