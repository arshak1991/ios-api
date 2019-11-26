const Follower = require('../../models/FollowersModel')
const User = require('../../models/UserModels')
const Stories = require('../../models/StoryModel')


exports.create = (req, res, next) => {


    User.findOne({
        _id: req.params.id,
    }, (err, docs) => {
        if (!err && docs.role === 'USER') {
            Follower.findOne({
                user_id: req.user._id,
                follower_id: req.params.id
            })
            .then(r => {
                if (r) {
                    res.json({
                        success: false,
                        message: "you already follower for this User"
                    })
                } else {
                    Follower.create({
                        user_id: req.user._id,
                        follower_id: req.params.id
                    }).then(r => {
                        res.json({
                            success: true,
                            message: "you became a follower for this User"
                        })
                    })
                }        
            })
        } else {
            const error = new Error("Such User doesn't exist")
            error.status = 401
            next(error)    
        }
    })
}

exports.getStories = (req, res, next) => {
    Follower.findOne({
        user_id: req.user._id,
        follower_id: req.params.id
    }).then(r => {
        if (r) {
            Stories.find({
                publisher: req.params.id,
                status: 'activated'
            }, (err, data) => {
                if (!err) {
                    res.json({
                        success: true,
                        stories: !data.length ? "This User haven't Stories" : data,
                        count: data.length
                    })
                } else {
                    const error = new Error("This User haven't Story")
                    error.status = 402
                    next(error)
                }
            })
        } else {
            const error = new Error("You not Follower for this User")
            error.status = 402
            next(error)
        }
    })
    
}