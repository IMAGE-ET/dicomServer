
import path from 'path'
import fs from 'fs'
import dicomParser from 'dicom-parser'
import Rusha from 'rusha'
import request from 'request-promise'
import express from 'express'
const router = express.Router();

const parent_dir = path.resolve('../../public')

router.get('/', (req, res) => {
  res.sendFile(parent_dir + '/index.html');
})

router.get('/patients', (req, res) => {
  request('http://35.154.52.109/patients')
    .then((data) => {
      let url = 'http://35.154.52.109/patients/';
      fetch_all_records(JSON.parse(data), url).then((patientRecords) => {
        res.send(patientRecords);
      })
    })
})

router.get('/patient', (req, res) => {
  request('http://35.154.52.109/patients/' + req.query.uuid)
    .then((data) => {
      res.send(data);
    })
})

router.get('/studies', (req, res) => {
  request('http://35.154.52.109/patients/' + req.query.uuid).then((patientData) => {
    let url = 'http://35.154.52.109/studies/';
    fetch_all_records(JSON.parse(patientData).Studies, url).then((studyData) => {
      res.send(studyData.map((item) => {
        return JSON.parse(item)
      }));
    })
  })
})

router.get('/series', (req, res) => {
  request('http://35.154.52.109/studies/' + req.query.uuid).then((studyData) => {
    let url = 'http://35.154.52.109/series/';
    fetch_all_records(JSON.parse(studyData).Series, url).then((seriesData) => {
      res.send(seriesData.map((item) => {
        return JSON.parse(item)
      }));
    })
  })
})


router.get('/instances', (req, res) => {
  request('http://35.154.52.109/series/' + req.query.uuid).then((seriesData) => {
    let url = 'http://35.154.52.109/instances/';
    fetch_all_records(JSON.parse(seriesData).Instances, url).then((instanceData) => {
      res.send(instanceData.map((item) => {
        return JSON.parse(item)
      }));
    })
  })
})


router.get('/instance', (req, res) => {
  let stream = request('http://35.154.52.109/instances/' + req.query.uuid + '/file')
    .pipe(fs.createWriteStream('dicomFile' + req.query.uuid + '.dcm'));
  stream.on('finish', () => {
    console.log('write stream finished')
    let responseObj = {};
    // let readStream = fs.createReadStream('dicomFile' + req.query.uuid + '.dcm');
    // let data = '';
    // readStream.on('data', (chunk) => {
    //   data += chunk;
    //   console.log('reading chunk ')
    // })
    // readStream.on('end', () => {
    //   console.log(data.length)
    // })

    var dicomFileAsBuffer = fs.readFileSync('dicomFile' + req.query.uuid + '.dcm');

    console.log('File SHA1 hash = ' + sha1(dicomFileAsBuffer));

    try {
      var dataSet = dicomParser.parseDicom(dicomFileAsBuffer);

      // // print the patient's name
      // responseObj.patientName = dataSet.string('x00100010');
      
      responseObj.StudyDate = dataSet.string('x00080020');
      responseObj.StudyTime = dataSet.string('x00080030');
      responseObj.Manufacturer = dataSet.string('x00080070');
      responseObj.InstitutionName = dataSet.string('x00080080');
      responseObj.StudyDescription = dataSet.string('x00081030');
      responseObj.InstitutionalDepartmentName = dataSet.string('x00081040');
      responseObj.OperatorsName = dataSet.string('x00081070');
      responseObj.PatientName = dataSet.string('x00100010');
      responseObj.PatientBirthDate = dataSet.string('x00100030');
      responseObj.BodyPartExamined = dataSet.string('x00180015');


      // // Get the pixel data element and calculate the SHA1 hash for its data
      // responseObj.pixelData = dataSet.elements.x7fe00010;
      // responseObj.pixelDataBuffer = dicomParser.sharedCopy(dicomFileAsBuffer, pixelData.dataOffset, pixelData.length);


      // if (pixelData.encapsulatedPixelData) {
      //   responseObj.imageFrame = dicomParser.readEncapsulatedPixelData(dataSet, pixelData, 0);

      //   if (pixelData.basicOffsetTable.length) {
      //     responseObj.imageFrame = dicomParser.readEncapsulatedImageFrame(dataSet, pixelData, 0);
          
      //   } else {
      //     responseObj.imageFrame = dicomParser.readEncapsulatedPixelDataFromFragments(dataSet, pixelData, 0, pixelData.fragments.length);
          
      //   }
      // }
    }
    catch (ex) {
      console.log(ex);
    }

    res.send(responseObj)

  })
})



function fetch_all_records(uuid_arr, url) {
  return new Promise((resolve, reject) => {
    Promise.all(uuid_arr.map((item) => {
      return requestAsync(url.concat(item))
    })).then((data) => {
      return resolve(data)
    })
  })
}


function requestAsync(url) {
  return new Promise((resolve, reject) => {
    request(url).then((res) => {
      return resolve(res)
    })
  })
}

function sha1(buffer, offset, length) {
  offset = offset || 0;
  length = length || buffer.length;
  var subArray = dicomParser.sharedCopy(buffer, offset, length);
  var rusha = new Rusha();
  return rusha.digest(subArray);
}

export default router 