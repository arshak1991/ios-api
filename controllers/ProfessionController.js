const Profession = require('../models/ProfessionModel')

exports.create = (req, res, next) => {
    const title = req.body.title
    const category = req.body.category
    if (title && title.length >= 5) {
        Profession.findOne({title: title})
            .then(data => {
                if (data == null) {
                    Profession.create({
                        title: title,
                        category: category
                    })
                        .then(data => {
                            res.json({
                                success: true,
                                data,
                            })
                        })
                } else {
                    let error = new Error("this Profession already exist")
                    error.status = 405
                    next(error)
                }
            })
    } else {
        let error = new Error("length should be min 5 words")
        error.status = 405
        next(error)
    }
}

exports.getProfessions = (req, res, next) => {
    Profession.find({}).then(data => {
        res.json({
            professions: data
        })
    })
}

exports.getProfession = (req, res, next) => {
    Profession.findOne({_id: req.params.id}).then((data) => {
        console.log(data);
        res.json({
            profession: data,
            success: true
        })
    }).catch(err => {
        const error = new Error("Such Profession doesn't exist")
        error.status = 402
        error.success = false
        next(error)
    })
}

exports.updateProfession = (req, res, next) => {
    Profession.findOneAndUpdate({_id: req.params.id}, {
        title: req.body.title
    }, {new: true}).then(data => {
        res.json({
            profession: data,
            success: true
        })
    }).catch(err => {
        const error = new Error("Such Profession doesn't exist")
        error.status = 402
        error.success = false
        next(error)
    })
}

exports.deleteProfession = (req, res, next) => {
    Profession.findOneAndDelete({_id: req.params.id}).then(data => {
        res.json({
            profession_id: req.params.id,
            message: 'Profession successfuly deleted',
            success: true
        })
    }).catch(err => {
        const error = new Error("Such Profession doesn't exist")
        error.status = 402
        error.success = false
        next(error)
    })
}
