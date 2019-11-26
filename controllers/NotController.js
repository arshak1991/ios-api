const Notification = require('../models/NotifiactionsModel')
const Professions = require('../models/ProfessionModel')
const User = require('../models/UserModels')
const transporter = require('../lib/mailer').transporter


exports.create = (req, res, next) => {
    Professions.findOne({title: req.body.profession}).then(data => {
        if (data !== null) {
            const note = {
                user: req.user._id,
                profession: data._id,
                description: req.body.description,
                links: req.body.links,
                linkedIn: req.body.linkedIn
            }
            User.findOne({
                _id: req.user.id,
                profession: null
            }).then(user => {
                if (user !== null) {
                    Notification.findOne({user: req.user._id}).then(docs => {
                        if (docs == null) {
                            Notification.create(note).then(note => {
                                res.json({
                                    note: note,
                                    success: true,
                                    title: data.title,
                                    message: `your application is send for ${data.title}`
                                })
                            })
                            .catch(err => {
                                const error = new Error(err)
                                error.status = 403
                                error.success = false
                                next(error)
                            })
                        } else {
                            const error = new Error('you have already applied for the Profession')
                            error.status = 403
                            error.success = false
                            next(error)
                        }
                    })
                } else {
                    const error = new Error('This User already have a Profession')
                    error.status = 403
                    error.success = false
                    next(error)
                }
            })
        } else {
            const error = new Error("Such Profession doesn't exist")
            error.status = 403
            error.success = false
            next(error)
        }  
    })
}

exports.getNotifications = (req, res, next) => {
    Notification.find({}).populate('user').populate('profession').then(data => {        
        if (!data.length) {
            res.json({
                success: false,
                message: "Notifications not yet!!"
            })
        } else {
            res.json({
                notifications: data,
                success: true
            })
        }
    })
}

exports.accept = (req, res, next) => {
    const notification = req.body;
    
    User.findOneAndUpdate({
        _id: notification.user._id,
        profession: null
    }, {
        profession: notification.profession._id
    }, {new: true}).populate('profession').then(data => {
        if (!data.length) {
            const mailOptions = {
                from: `<${process.env.ADMIN_EMAIL}>`, // sender address
                to: `${notification.user.email}`, // list of receivers
                subject: 'Hi ', // Subject line
                html: `Hi. Your Request for Profession <strong>${notification.profession.title}</strong> is Accepted`, // plain text body
            };
            let message 
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    message = "Please. Try Again!!"
                } else {
                    message = "Please! Check your Email"
                }
                transporter.close()
            })
            res.json({
                success: true,
                user: data,
                message: message
            })
        } else {
            res.json({
                success: false,
                message: 'This User already have Profession'
            })
        }
    }).catch(err => {
        const error = new Error("You already have Profession")
        error.status = 403
        error.success = false
        next(error)
    })
}

exports.cancel = (req, res, next) => {    
    Notification.findOneAndDelete({_id: req.params.id}).populate('user').populate('profession').then(data => {        
        if(req.headers.flag == 'cancel'){
            const mailOptions = {
                from: `<${process.env.ADMIN_EMAIL}>`, // sender address
                to: `${data.user.email}`, // list of receivers
                subject: 'Hi ', // Subject line
                html: `Hi. Your Request for Profession <strong>${data.profession.title}</strong> is CANCELED`, // plain text body
            };
            let message = ''
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    message += "Please. Try Again!!"
                } else {
                    message += "Please! Check your Email"
                }
                transporter.close()
            })
        }
        res.json({
            success: true,
            message: "Notification successfully deleted!",
        })
    })
}