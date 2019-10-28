var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function (req, res, next) {
  setTimeout(() => {
    res.json({
      success: true,
    });
  }, 2000);

});

module.exports = router;
