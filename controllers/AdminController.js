const Users = require('../models/UserModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Valid = require('../helpers/validation')
const Auth = require('../middleware/Auth')


exports.login = (req, res, next) => {
    const email = req.body.email.trim()
    const userData = {
        email: email,
        password: req.body.password
    }
    
    Users.findOne({
        email: req.body.email
    }).then(user => {
        if (user.role === 'USER') {
            res.json({
                success: false,
                message: "Such ADMIN does not exist"
            })
        } else if (!user) {
            const error = new Error("email is uncorrect")
            error.status = 400
            next(error)
        } else {
            bcrypt.compare(userData.password, user.password, (err, hash) => {
                if (hash) {
                    var token = jwt.sign({
                        id: user._id,
                        email: user.email
                    }, "SuperSecRetKey", {
                            expiresIn: '365d' // expires in 24 hours
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
                    error.msg = "password is wrong"
                    error.status = 401
                    next(error)
                }
            })
        }
    }).catch(err => {
        const error = new Error(err)
        error.msg = 'Such Admin doesn\'t exist'
        error.success = false
        next(error)
    })
}

exports.registr = (req, res, next) => {
    const validation = Valid.userValidation(req.body)
    if (!validation.validationType) {
        // next(new Error(validation.messages));
        res.status(400).json({ type: "error", messages: validation.messages })
        return;
    }

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
                        // console.log(Users)
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

exports.getUsers = (req, res, next) => {
    Users.find({}, (err, docs) => {
        if (!err) {
            res.json({
                users: docs
            })
        } else {
            throw err;
        }
    })
}

exports.getUser = (req, res, next) => {
    Users.findOne({_id: req.params.id}, (err, docs) => {
        if (!err) {
            res.json({
                user: docs
            })
        } else {
            next(new Error("Such User doesn't exist!!"))
        }
    })
    
}

exports.updateUser = (req, res, next) => {
    let reqBody = req.body
    
    const validation = Valid.userValidation(req.body, true)
    if (!validation.validationType) {
        res.status(400).json({ type: "error", messages: validation.messages })
        return;
    }
    const userId = req.body.id
    const userData = {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email
    }
    
    Users.findOneAndUpdate({_id: userId}, userData, {new: true},
        (err, userData) => {
            // Handle any possible database errors
            if (!err) {
                return res.json({
                    result: userData,
                    message: 'User successfully Updated',
                    success: true
                });
            }
            res.status(502).json({
                error: err,
                message: "Such email already registered",
                success: false
            })
            
        }
    )
}

exports.deleteUser = (req, res, next) => {
    Users.findOneAndRemove({_id: req.params.id}, (err) => {
        if (err) return res.status(500).json({err: err});
        return res.status(201).json({
            user_id: req.params.id,
            message: 'User successfully Deleted',
            success: true
        });
    })
}

exports.changePassword = (req, res, next) => {
    if (req.body.newPassword === req.body.cPassword) {
        bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
            console.log(hash)
            Users.findOneAndUpdate({_id: req.params.id}, {$set: {password: hash}}, (err, docs) => {
                if (err) {
                    res.status(402).json({error: err})
                }
                res.json({
                    data: docs,
                    message: 'Password successfully Updated',
                    success: true
                })
            })
        })
    }else{
        res.json({
            error: "Confirm Password don't like new Password"
        })
    }
    
}
