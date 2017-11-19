var express = require('express');
var router = express.Router();
//心知天气API引入
var Api = require('../lib/api.js');
const UID = "U69B76CDDC"; //用户ID
const KEY = "9kzyvugupdig2tqd"; //Key
var api = new Api(UID, KEY);
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: '我的地图App'});
});
//获取天气信息
router.get('/weather', function(req, res, next) {
    api.getWeatherNow(req.query.city).then(function(data) {
        res.json(data.results[0]);
    }).catch(function(err) {
        res.json(false);
    });
});
module.exports = router;
