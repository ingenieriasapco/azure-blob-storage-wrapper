const fs = require('fs');
const azure = require('azure-storage');

const blobService = azure.createBlobService();

const blobStorage = {
  addFromText     : _addFromText,
  drop            : _drop,
  dropByPrefix    : dropByPrefix,
  search          : _search,
  searchByPrefix  : _searchByPrefix,
  download        : _download,
  downloadByPrefix: _downloadByPrefix
};

/**
 * Create azure blob from Text
 *
 * @param {string} containerName - The Azure container name
 * @param {string} blobContent - string
 * @param {string} blobName - Name the blob
 * @param {object} options - content Settings / contentType
 * @private
 */
function _addFromText(containerName, blobContent, blobName, options) {
  const settings = { publicAccessLevel: 'blob'};

  return _createContainer(containerName, settings)
    .then((result)=>{
      return _addBlobFromText(result.name, blobContent, blobName, options);
    });

}

/**
 * Marks the specified blob or snapshot for deletion.
 *
 * @param {string} containerName - The container name
 * @param {string} blobName - The blob name.
 * @returns {promise}
 * @private
 */
function _drop(containerName, blobName) {
  return new Promise((resolve, reject)=>{
    blobService.deleteBlob(containerName, blobName, (error, result) =>{
      if (error) reject(error);

      resolve(result);
    });
  });

}

function dropByPrefix(containerName, prefix) {
  return _searchByPrefix(containerName, prefix)
          .then((list) => {
            list.forEach((item, index)=>{
              blobService.deleteBlob(containerName, item.name, function(error, response){
                if(!error){
                  console.log('Delete: ', response);
                }
              });
            })
          })
}

/**
 *
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
function _search(containerName) {
  return new Promise((resolve, reject) => {
    blobService.listBlobsSegmented(containerName, null, function(error, result, response){
      if(error) reject(error);

      resolve(result.entries);
    });
  })
}

function _download() {

}

function _downloadByPrefix() {

}

/**
 *
 * @param containerName
 * @param settings
 * @returns {boolean}
 * @private
 */
function _createContainer(containerName, settings) {
  return new Promise((resolve, reject)=>{
    blobService.createContainerIfNotExists(containerName, settings,
      (error, result, response) => {
        if (error) reject(error);

        resolve(result);
      });
  });
}

/**
 * Uploads a block blob from a text string.
 *
 * @param containerName
 * @param blobContent
 * @param blobName
 * @param options
 * @returns {promise}
 * @private
 */
function _addBlobFromText(containerName, blobContent, blobName, options) {
  return new Promise((resolve, reject) => {
    blobService.createBlockBlobFromText(
      containerName, blobName, blobContent, options,
      (error, result, response) => {
        if (error) {
          reject(error);
        }

        resolve(`https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${result.container}/${result.name}`)
      })
  })
}


module.exports = blobStorage;
