const express = require('express')
const router = express.Router()
const cors = require('cors')

const users = require('../controllers/ios/UsersController')
const story = require('../controllers/ios/UserStoryController')
const category = require('../controllers/ios/UserCategoryController')
const follower = require('../controllers/ios/FollowerController')
const notification = require('../controllers/NotController')

const passport = require('passport')
const finds = require('../middleware/finds')
const upload = require('../middleware/uploadSingleImage')
router.use(cors())

const multer = require('multer');

//Routers for User

router.post('/registration', finds.findRole, users.registr)
router.post('/login', users.login)
router.post('/forgotPass', finds.findUserByEmail, users.forgotPass)
router.put('/user/update', passport.authenticate('jwt', { session: false }), users.update)
router.get('/users', passport.authenticate('jwt', { session: false }), users.getUsers)
router.post('/userCategory', passport.authenticate('jwt', { session: false }), finds.findCategories, finds.findUserCategories, users.f_Category)
router.put('/user/avatar', passport.authenticate('jwt', { session: false }), upload.single('file'), users.createAvatar)

// Routers for User Stories

router.post('/story', passport.authenticate('jwt', { session: false }), upload.any(), story.create)
router.get('/story', story.getStories)
router.put('/story/:id', passport.authenticate('jwt', { session: false }), finds.find, story.UpdateStory)
router.get('/story/:id', story.getStory)
router.patch('/story/:id', finds.find, story.addSeen)
router.delete('/story/:id', passport.authenticate('jwt', { session: false }), finds.find, story.deleteStory)
router.post('/story/comments/:id', passport.authenticate('jwt', { session: false }), story.createComment)
router.post('/story/like/:id', passport.authenticate('jwt', { session: false }), finds.findLike, story.createLike)
router.get('/storyByFawCategory/:categoryId', passport.authenticate('jwt', { session: false }), story.StoryByFawCategory)
router.get('/story/category/:categoryId', story.StoryByCategory)

// Routers for User Categories

router.get('/category', category.getCategories)

// Routers for Followers

router.post('/follower/:id', passport.authenticate('jwt', { session: false }), follower.create)
router.get('/follower/:id', passport.authenticate('jwt', { session: false }), follower.getStories)

// Routers for Notifications

router.post('/notifications', passport.authenticate('jwt', { session: false }), notification.create)

module.exports = router;
