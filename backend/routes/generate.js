const express = require('express')
const { generateSession } = require('../controllers/generateController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.use(requireAuth)
router.post('/', generateSession)

module.exports = router