var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var Poll = mongoose.model('Poll');
var User = mongoose.model('User');

function isAuthenticated(req,res,next){
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}
	return res.redirect('/#login');
};

router.use('/poll', isAuthenticated);



router.route('/poll')
	.post(function(req, res){
		var poll = new Poll();
		poll.topic = req.body.topic;
		poll.options = req.body.options;
		poll.created_by = req.body.created_by;
		poll.save(function(err, poll){
			if (err){
				return res.send(500, err);
			}
			return res.json(poll);
		});
	})

	.get(function(req, res){
		Poll.find(function(err, polls){
			if(err){
				return res.send(500,err);
			}
			return res.send(polls);
		});
	});

router.route('/poll/:id')
	.put(function(req,res){
		Poll.findById(req.params.id, function(err, poll){
			if (err) {
				return res.send(err);
			}
			poll.options = req.body.options;
			poll.save(function(err, poll){
				if (err){
					return res.send(err)
				}
				return res.send(poll);
			});
		});
	})
	.get(function(req,res){
		Poll.findById(req.params.id, function(err, poll){
			if(err){
				return res.send(err);
			}
			return res.json(poll);
		})
	})
	.delete(function(req,res){
		Poll.remove({
			_id: req.params.id
		}, function(err){
			if(err){
				res.send(err);
			}
			res.json("deleted:(");
		});
	});
router.route('/user/:username')
	.get(function(req,res){
		Poll.find({created_by: req.params.username}, function(err, polls){
			if (err){
				return res.send(err);
			}
			return res.json(polls);
		})
	});

router.route('/edit/:id')
	.put(function(req,res){
		Poll.findById(req.params.id, function(err, poll){
			if (err) {
				return res.send(err);
			}
			poll.topic = req.body.topic;
			poll.options = req.body.options;
			poll.save(function(err, poll){
				if (err){
					return res.send(err);
				}
				return res.send(poll);
			});
		});
	});


module.exports = router;