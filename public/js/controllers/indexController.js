
angular.module('searchApp', ["ui.router"])

  .controller('patientsController', function ($scope, $http) {
    $http.get('/patients').then((res) => {
      let patientRecords = res.data.map((item) => {
        return JSON.parse(item)
      })
      $scope.patientRecords = patientRecords;
      window.data = patientRecords;
    })
  })

  .controller('patientController', function ($scope, $http, $stateParams) {
    $http.get('/patient?uuid=' + $stateParams.patientID).then((res) => {
      window.patientData = res;
      $scope.patientRecords = res.data;

    }).catch((err) => {
      console.log('err while fetching data for patient: ' + err)
    })

  })

  .controller('studiesController', function ($scope, $http, $stateParams) {
    $http.get('/studies?uuid=' + $stateParams.studiesID).then((res) => {
      window.studyData = res.data;
      $scope.studyRecords = res.data;

    }).catch((err) => {
      console.log('err while fetching data for patient: ' + err)
    })

  })

  .controller('seriesController', function ($scope, $http, $stateParams) {
    $http.get('/series?uuid=' + $stateParams.seriesID).then((res) => {
      window.seriesData = res.data;
      $scope.seriesRecords = res.data;

    }).catch((err) => {
      console.log('err while fetching data for patient: ' + err)
    })

  })

  .controller('instancesController', function ($scope, $http, $stateParams) {
    $http.get('/instances?uuid=' + $stateParams.instanceID).then((res) => {
      window.instanceData = res.data;
      $scope.instanceRecords = res.data;

    }).catch((err) => {
      console.log('err while fetching data for patient: ' + err)
    })
  })

  .controller('instanceController', function ($scope, $http, $stateParams) {
    
    $http.get('/instance?uuid=' + $stateParams.instanceID).then((res) => {
      console.log('data babu aa gye');
      window.dicomData = res.data;
      $scope.instanceRecords = res.data;

    }).catch((err) => {
      console.log('err while fetching data for patient: ' + err)
    })
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/')

    $stateProvider
      .state("/", {
        url: "/",
        templateUrl: "views/patients.html",
        controller: "patientsController"
      })
      .state("patient", {
        url: "/patient/:patientID",
        templateUrl: "views/patient.html",
        controller: "patientController"
      })
      .state("studies", {
        url: "/studies/:studiesID",
        templateUrl: "views/studies.html",
        controller: "studiesController"
      })
      .state("series", {
        url: "/series/:seriesID",
        templateUrl: "views/series.html",
        controller: "seriesController"
      })
      .state("instances", {
        url: "/instances/:instanceID",
        templateUrl: "views/instances.html",
        controller: "instancesController"
      })
      .state("instance", {
        url: "/instance/:instanceID",
        templateUrl: "views/instance.html",
        controller: "instanceController"
      })
  })


