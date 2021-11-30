const Users = require('../../models/UserModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Valid = require('../../helpers/validation');
const transporter = require('../../lib/mailer').transporter
const Promise = require('bluebird')
const avatarPath = './uploads/avatars'
const fs = require('fs')
const CategoryHelper = require('../../helpers/categoryByName')
const URL = require('url').URL

function deleteFile (file) { 
    fs.unlink(file, function (err) {
        if (err) {
            console.error(err.toString());
        } else {
            console.warn(file + ' deleted');
        }
    });
}

exports.registr = (req, res, next) => {
    const validation = Valid.userValidation(req.body)
    if (!validation.validationType) {
        // next(new Error(validation.messages));
        res.status(400).json({ type: "error", messages: validation.messages })
        return;
    }
    console.log("hello");
    const userData = {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
    }

    Users.findOne({
        email: req.body.email
    })
        .then(user => {            
            if (!user) {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (req.body.password === req.body.c_password) {
                        userData.password = hash;
                        Users.create(userData)
                            .then(user => {
                                const token = jwt.sign({
                                    id: user._id,
                                    email: user.email
                                }, "SuperSecRetKey", {
                                        expiresIn: 86400 // expires in 24 hours
                                    });
                                res.json({
                                    status: user.email + " registered",
                                    name: user.name,
                                    surname: user.surname,
                                    email: user.email,
                                    token: token
                                })
                            })
                            .catch(err => {
                                res.json({ error: err, msg: "error" })
                            })
                    } else {
                        res.json({
                            error: 'Confirm Password don\'t like Password'
                        })
                    }

                })
            } else {
                res.json({
                    error: `${user.role} already exist:`
                })
            }
        })
        .catch(err => {
            res.json({ error: err })
        })
}

exports.login = (req, res, next) => {
    const userData = {
        email: req.body.email,
        password: req.body.password
    }
    
    Users.findOne({
        email: req.body.email
    }).then(user => {
        if (!user) {
            const error = new Error("email is uncorrect")
            error.status = 400
            next(error)
        }else if (user.role === 'USER') {
            bcrypt.compare(userData.password, user.password, (err, hash) => {
                if (hash) {
                    var token = jwt.sign({
                        id: user._id,
                        email: user.email,
                        name: user.name
                    }, "SuperSecRetKey", {
                            expiresIn: '365d' // expires in 365 days
                        });
                    res.json({
                        status: "success",
                        id: user._id,
                        name: user.name,
                        surname: user.surname,
                        email: user.email,
                        token: token
                    })
                } else {
                    const error = new Error("password is wrong")
                    error.status = 401
                    next(error)
                }
            })
        } else {
            res.status(402).json({
                success: false,
                message: "Such USER does not exist"
            })
        }
    })
}

exports.forgotPass = (req, res, next) => {

    let str = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);

    bcrypt.hash(str, 10, (err, hash) => {
        Users.findOneAndUpdate({email: req.body.email}, {$set: {password: hash}}, (err, docs) => {
            if (err) {
                const error = new Error(err)
                error.status = 405
                next(error)
            }
            const mailOptions = {
                from: `<${process.env.ADMIN_EMAIL}>`, // sender address
                to: `${req.body.email}`, // list of receivers
                subject: 'Hello ', // Subject line
                html: `Hello my dear your new password is <strong>${str}</strong>`, // plain text body
            };
        
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: "Please. Try Again!!"
                    })
                } else {
                    res.status(200).json({
                        success: true,
                        message: "check your Email I sent your new Password"
                    });
                }
                transporter.close()
            })
        })
    })
}

exports.update = (req, res, next) => {    
    let reqBody = req.body
    
    const validation = Valid.userValidation(req.body, true)
    if (!validation.validationType) {
        res.status(400).json({ type: "error", messages: validation.messages })
        return;
    }
    const userId = req.user._id
    const userData = {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email
    }
    Users.findOneAndUpdate({_id: userId}, userData, {new: true},
        (err, userData) => {
            // Handle any possible database errors
            if (err) return res.status(500).json({
                err: err,
                message: "Such email already registered",
                success: false
            });
            return res.json({
                result: userData,
                message: 'User successfully Updated',
                success: true
            });
        }
    )
}

exports.getUsers = (req, res, next) => {
    const userId = req.user.id
    Users.find({
        '_id': {'$ne': req.user.id},
        role: 'USER'
    }).then(data => {
        res.json({
            users: data,
            count: data.length
        })
    }).catch(err => {
        next(new Error(err));
    })
}

exports.f_Category = async (req, res, next) => {
    let arr = []
    req.body.categories.forEach(element => {
        arr.push(CategoryHelper(element))
    })
    
    Promise.all(arr)
        .then((categories) => {
            console.log(categories);
            Users.findOneAndUpdate({_id: req.user._id}, {$push: {
                favouriteCategories: categories
            }}, {new: true}, 
                (err, data) => {
                    if(err) return res.status(400).json({
                        error: err,
                        success: false
                    })
                    res.json({
                        data: data,
                        message: 'Favourte Categories for User successfully added',
                        success: true
                    })
                }
            )
            
        })
        .catch((err) => {
            const error = new Error(err)
            error.status = 402
            error.success = false
            next(error)
        });
}

exports.createAvatar = (req, res, next) => {
    Users.findOneAndUpdate(
        {
            _id: req.user._id,
        }, 
        {
            'avatar': `${process.env.SERVER_URL}/uploads/avatars/${req.file.filename}`
        })
        .then(data => {
            if (data == null) {
                deleteFile(avatarPath + '/' + req.file.filename)
                return next(new Error('you already have Avatar'))
            }
            if (data.avatar !== `${process.env.SERVER_URL}/default/users.jpg`) {
                deleteFile(`.${new URL(data.avatar).pathname}`)
            }
            Users.findOne({_id: data._id}).then(user => {
                res.json({
                    data: user,
                    success: true
                })
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.status = 402
            error.success = false
            next(error)
        })
}