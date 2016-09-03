

var app = angular.module('vote-app', ['ngRoute', 'ngResource', 'ui.bootstrap', 'chart.js']).run(function($http, $rootScope){
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
	
	$rootScope.signout = function(){
		$http.get('auth/signout');
		$rootScope.authenticated = false;
		$rootScope.current_user = '';
	};
});

app.config(function($routeProvider){
	$routeProvider
		.when('/',{
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		.when('/login', {
			templateUrl:'login.html',
			controller: 'authController'
		})
		.when('/register',{
			templateUrl: 'register.html',
			controller: 'authController'
		})
		.when('/poll/new',{
			templateUrl: 'new-poll.html',
			controller: 'mainController'
		})
		.when('/poll/:id', {
			templateUrl: 'vote-page.html',
			controller: 'voteController'
		})
		.when('/edit/:id', {
			templateUrl: 'edit-poll.html',
			controller: 'editController'
		})
		.when('/user/:username', {
			templateUrl: 'user-page.html',
			controller: 'userController'
		});
});

app.factory('postService', function($resource){
	return $resource('/api/poll/:id');
});

app.controller('editController', function($scope, $rootScope, $location, $http, $routeParams, postService){
	$scope.currentPoll= postService.get({id:$routeParams.id});
	$scope.submitEdits = function(){
		$http.put('/api/edit/' + $scope.currentPoll._id, $scope.currentPoll).success(function(){
		$location.path('/');
		});
	};
	$scope.addOption = function(){
		if ($scope.currentPoll.options.length < 10){
		$scope.currentPoll.options.push({text:'',votes: 0, voters:[]});
	}else{
		alert('Too many options!');
	};
	};
});
app.controller('userController', function($scope, $rootScope, $location, $http, $routeParams, postService){
	$scope.polls = [];
	$scope.isMyPage = null;
	if ($rootScope.current_user === $routeParams.username) {
		$scope.isMyPage = true;
	}
	else {
		$scope.isMyPage = false;
	};
	$scope.getUserPolls = function(){$http.get('/api/user/' + $routeParams.username).success(function(data){
		$scope.polls = data;
		});
	};
	$scope.getUserPolls();
	$scope.getCurrentPoll = function(poll){
		$location.path('/poll/' + poll._id);
	};
	$scope.goToEdit = function(poll){
		$location.path('/edit/' + poll._id);
	};
	$scope.deletePoll = function(poll){
		postService.delete({id:poll._id}, $scope.getUserPolls())
	};


});

app.controller('voteController', function($scope, $rootScope, $location, $http, $routeParams, postService){
	$scope.vote = {index: null};
	$scope.voted = null;
	$scope.labels = [];
 	$scope.data = [];
	$scope.voteCheck = function(){
		for (var i = 0 ; i < $scope.currentPoll.options.length ; i++) {
			if ($scope.currentPoll.options[i].voters.includes($rootScope.current_user)){
				$scope.vote.index = i;
				return true
			}
		}
		return false
	};
	$scope.setChart = function(){
		$scope.labels = [];
 		$scope.data = [];
		for (var i = 0; i < $scope.currentPoll.options.length; i++) {
			$scope.labels.push($scope.currentPoll.options[i].text);
			$scope.data.push($scope.currentPoll.options[i].votes)
		};
	};
	$scope.currentPoll= postService.get({id:$routeParams.id});
	$scope.currentPoll.$promise.then(function(){
		$scope.setChart();
		$scope.voted = $scope.voteCheck();
	});
	
	$scope.submitVote = function(){
		$scope.currentPoll.options[$scope.vote.index].votes++;
		$scope.currentPoll.options[$scope.vote.index].voters.push($rootScope.current_user);
		$http.put('/api/poll/' + $scope.currentPoll._id, $scope.currentPoll).success(function(){
			$scope.voted = true;
			$scope.setChart();
		});
	};
});

app.controller('mainController', function(postService, $rootScope, $scope, $location, $http){
	$scope.polls = postService.query();
	$scope.newPoll = {created_by: '', topic: '', options: [{text:"",votes:0, voters:[]}], created_at:''};

	$scope.goToUser = function(user){
		$location.path('/user/' + user);
	};

	$scope.getCurrentPoll = function(poll){
		$location.path('/poll/' + poll._id);
	};

	$scope.createNewPoll = function(){
		$scope.newPoll.created_at = Date.now();
		$scope.newPoll.created_by = $rootScope.current_user;
		postService.save($scope.newPoll, function(){

			$scope.polls = postService.query();
			$scope.newPoll = {created_by: '', topic: '', options: [], created_at:''};
			$location.path('/');
		});
	};
	$scope.addOption = function(){
		if ($scope.newPoll.options.length < 10){
		$scope.newPoll.options.push({text:'',votes: 0, voters:[]});
	}else{
		alert('Too many options!');
	};
	};
});

app.controller('authController', function($scope, $http, $rootScope, $location){
	$scope.user = {username: '', password: ''};
	$scope.error_message = '';

	$scope.login = function(){
		$http.post('/auth/login', $scope.user).success(function(data){
			if(data.state == 'success'){
				$rootScope.authenticated = true;
				$rootScope.current_user = data.user.username;
				$location.path('/');
			}
			else{
				$scope.error_message = data.message;
			}
		});
	};
	$scope.register = function(){
		$http.post('/auth/signup', $scope.user).success(function(data){
			if(data.state == 'success'){
				$rootScope.authenticated = true;
				$rootScope.current_user = data.user.username;
				$location.path('/');
			}
			else{
				$scope.error_message = data.message;
			}
		});
	};
})