var express = require("express");
var bodyParser = require("body-parser");
var app = express();
//const azure = require('azure-storage');
var blobStorage = require('./azure-blob-storage');

var server = app.listen(3000, function() {

  /*nconf.argv()
  .env()
  .file({ file:
  'config.json'
});*/
  const base64str = "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";
  var stringAscii = new Buffer(base64str, 'base64');
  var options = {contentSettings: { contentType: 'image/png' }};

  /*blobStorage
    .addFromText('images', stringAscii, 'loop-let', options)
    .then((result)=>{
      console.log(result);
    })
    .catch((err) => {
      console.log('Error', err);
    })*/

    blobStorage
      .searchByPrefix('images', 'loop-let')
      .then((result)=>{
        console.log(result);
      })
      .catch((err) => {
        console.log('Error', err);
      })

//explicit
/*for (var i = 0; i < 10; i++) {

var nameImage= 'sapco-image_' + i;
//Add blob/images
addImage(nameImage);
}*/

//addImageBuffer('sapco-image_Holi');
//
/*var data = fs.readFileSync('duplicatecode.jpg');
console.log(data.toString('base64'));

new Buffer(data.toString(), 'base64').toString('ascii');*

//searchImagesByPrefix();
/*var blobService = azure.createBlobService();
var containerName = 'images';
blobService.listBlobsSegmented(containerName, null, function(err, result) {
if (err) {
console.log("Couldn't list blobs for container %s", containerName);
console.error(err);
} else {
console.log('Successfully listed blobs for container %s', containerName);
console.log(result.entries);
console.log(result.continuationToken);
}
});*/

console.log("Listening on port %s...", server.address().port);
});

function addImage(nameImage) {
  var blobService = azure.createBlobService();

  blobService.createContainerIfNotExists('images', {
    publicAccessLevel: 'blob'
  }, function(error, result, response) {
    if (!error) {

      blobService.createBlockBlobFromLocalFile('images', nameImage, 'duplicatecode.jpg', function(error, result, response) {
        if (!error) {
          //console.log('Result Images: ', result);
          var url = `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${result.container}/${result.name}`;
          console.log('URL: ', url);
        }else{
          console.log('error Image', error);
        }
      });
    }else{
      console.log('error', error);
    }
  });
}

function addImageBuffer() {


  var options = {
    contentSettings: { contentType: 'image/png' }
    };

  var blobService = azure.createBlobService();

  blobService.createBlockBlobFromText(
    'images',
    'loop-base64',
    base64str,
    options,
    function(error, result, response){
        if(error){
            console.log("Couldn't upload string");
            console.error(error);
        } else {
            console.log('String uploaded successfully', `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${result.container}/${result.name}`);
        }
    });
}


function downloadBlobs(list) {
  var blobService = azure.createBlobService();
  console.log(list[0].name);
  for (var i = 0; i < list.length; i++) {
    blobService.getBlobToStream('images', list[i].name,
    fs.createWriteStream(list[i].name+'.jpg'), function(error, result, response){
      if(!error){
        console.log('Donwload: ', result);
      }
    });
  }

}

function deleteBlobs(list) {
    var blobService = azure.createBlobService();
    console.log(list[0].name);
    for (var i = 0; i < list.length; i++) {
      blobService.deleteBlob('images', list[i].name, function(error, response){
        if(!error){
          console.log('Delete: ', response);
        }
      });
    }

  }

function searchImagesByPrefix(prefix) {
    var blobService = azure.createBlobService();
    var containerName = 'images';
    var prefix = 'sapco-';
    blobService.listBlobsSegmentedWithPrefix(
      containerName,
      prefix,
      null,
      function(err, result) {
        if (err) {
          console.log("Couldn't list blobs");
          console.error(err);
        } else {
          console.log("Found blobs with prefix %s", prefix);
          //console.log(result.entries);


          //downloadBlobs(result.entries)
          deleteBlobs(result.entries)
        }
      });
    }
