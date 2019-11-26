const express = require('express');
const router = express.Router();
const cors = require('cors');
const users = require('../controllers/AdminController');
const category = require('../controllers/CategoryController')
const story = require('../controllers/StoryController')
const profession = require('../controllers/ProfessionController')
const notification = require('../controllers/NotController')
const passport = require('passport')
// const multer = require('multer')

const upload = require('../middleware/uploadSingleImage')
router.use(cors())
/* GET api page. */

// Routers for User

router.post('/registration', passport.authenticate('jwt', { session: false }), users.registr)
router.post('/login', users.login)
router.get('/users', passport.authenticate('jwt', { session: false }), users.getUsers)
router.get('/user/:id', passport.authenticate('jwt', { session: false }), users.getUser)
router.put('/user/update', passport.authenticate('jwt', { session: false }), users.updateUser)
router.delete('/user/:id', passport.authenticate('jwt', { session: false }), users.deleteUser)
router.post('/user/:id', passport.authenticate('jwt', { session: false }), users.changePassword)

// Routers for Category

router.post('/category', passport.authenticate('jwt', { session: false }), category.create)
router.get('/category', passport.authenticate('jwt', { session: false }), category.getCategories)
router.get('/category/:id', passport.authenticate('jwt', { session: false }), category.getCategory)
router.put('/category/update', passport.authenticate('jwt', { session: false }), category.updateCategory)
router.delete('/category/:id', passport.authenticate('jwt', { session: false }), category.deleteCategory)

// Routers for Story

router.post('/story', passport.authenticate('jwt', { session: false }), upload.any(), story.create)
router.post('/story/comments/:id', passport.authenticate('jwt', { session: false }), story.createComment)
router.get('/story', passport.authenticate('jwt', { session: false }), story.getStories)
router.put('/story/:id', passport.authenticate('jwt', { session: false }), story.acceptStory)
router.get('/story/:id', passport.authenticate('jwt', { session: false }), story.getStory)
router.patch('/story/update', passport.authenticate('jwt', { session: false }), story.updateStory)
router.delete('/story/:id', passport.authenticate('jwt', { session: false }), story.deleteStory)

// Routers for Profession

router.post('/profession', passport.authenticate('jwt', { session: false }), profession.create)
router.get('/profession', passport.authenticate('jwt', { session: false }), profession.getProfessions)
router.get('/profession/:id', passport.authenticate('jwt', { session: false }), profession.getProfession)
router.put('/profession/:id', passport.authenticate('jwt', { session: false }), profession.updateProfession)
router.delete('/profession/:id', passport.authenticate('jwt', { session: false }), profession.deleteProfession)

// Routers for Notifications

router.get('/notifications', passport.authenticate('jwt', { session: false }), notification.getNotifications)
router.put('/notifications/:id', passport.authenticate('jwt', { session: false }), notification.accept)
router.delete('/notifications/:id', passport.authenticate('jwt', { session: false }), notification.cancel)

module.exports = router;
