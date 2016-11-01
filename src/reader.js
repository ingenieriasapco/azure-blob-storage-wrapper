const azure = require('azure-storage');
const path = require('path');
const stream = require('stream');

const blobService = azure.createBlobService();

const Reader = {
  listContainerBlobs  : _listContainerBlobs,
  searchByPrefix      : _searchByPrefix,
  download            : _download,
  downloadByPrefix   : _downloadsByPrefix,
}

/**
 * List all the blobs that matches with the prefix in a container
 *
 * @param {string} containerName - The container name
 * @param prefix
 * @returns {boolean}
 * @private
 */
function _searchByPrefix(containerName, prefix) {
  return new Promise((resolve, reject) => {
    blobService.listBlobsSegmentedWithPrefix(containerName, prefix, null, function(error, result, response){
      if(error) reject(error);

      resolve(result.entries);
    });
  })
}

/**
 * List the blobs in a container.
 *
 * @param {string} containerName - The container name
 * @returns {promise}
 * @private
 */
function _listContainerBlobs(containerName) {
  return new Promise((resolve, reject) => {
    blobService.listBlobsSegmented(containerName, null, function(error, result, response){
      if(error) reject(error);

      resolve(result.entries);
    });
  })
}

/**
 * Download a specified blob in a container
 *
 * @param {string} containerName - The container name
 * @param {string} blobName - The name of the blob to download
 * @param {string} destinationPath - The destination path of the downloaded blob
 * @returns {promise}
 * @private
 */
function _download(containerName, blobName, destinationPath) {
  return new Promise((resolve, reject) => {
    blobService.getBlobToLocalFile(
      containerName, 
      blobName, 
      path.resolve(destinationPath, blobName), 
      (err, blob) => {
      if (err) reject(err);

      resolve(blob);
    });
  });
}

/**
 * Download the blobs that matches the prefix in a container
 *
 * @param {string} containerName - The container name
 * @param {string} blobName - The name of the blob to download
 * @param {string} destinationPath - The destination path of the downloaded blob
 * @returns {promise}
 * @private
 */
function _downloadsByPrefix(containerName, prefix, destinationPath) {
  return _searchByPrefix(containerName, prefix)
    .then((blobs) => {
      const downloadedBlobs = [];
      blobs.forEach((item, index) => {
        let currentBlob = _download(containerName, item.name, destinationPath);
        downloadedBlobs.push(currentBlob);        
      });
      return Promise.all(downloadedBlobs);
    });
}

module.exports = Reader;