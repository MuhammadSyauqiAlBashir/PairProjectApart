const express = require('express')
const Controller = require('../controllers/controller')
const router = express.Router()


router.get('/apartements', Controller.listApart)

module.exports = router