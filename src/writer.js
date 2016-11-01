const azure = require('azure-storage');
const stream = require('stream');
const Reader = require('./reader');

const blobService = azure.createBlobService();

const Writer = {
  addFromString       : _addFromString,
  addFromText         : _addFromText,
  drop                : _drop,
  dropByPrefix        : _dropByPrefix,
  createContainer     : _createContainer,
}

/**
 * Get Readable Stream based on string
 * 
 * @param {string} content - The string content
 * @param {object} options - contentSettings options
 * @returns
 */
function _getStream(content, options) {
  const contentEncoding = options ? options.contentEncoding : null;
  const buffer = contentEncoding ? new Buffer.from(content, contentEncoding) : new Buffer.from(content);
  const bufferStream = new stream.PassThrough();
  
  bufferStream.end(buffer);
  
  return bufferStream;
}

/**
 * Uploads a block blob from a string.
 *
 * @param {string} containerName - The name of the container
 * @param {string} blobContent - The blob content
 * @param {string} blobName - The blob name
 * @param {object} contentSettings - supported: contentType, contentEncoding, contentLanguage, \
 * cacheControl, contentDisposition, contentMD5
 * @returns {promise}
 * @private
 */
function _addFromString(containerName, blobContent, blobName, options) {
  const streamBuffer = _getStream(blobContent, options);
  const fullOptions = {
    contentSettings: Object.assign({}, options),
  };

  return new Promise((resolve, reject) => {
    blobService.createBlockBlobFromStream(
      containerName,
      blobName,
      streamBuffer,
      blobContent.length,
      fullOptions,
      (error, result, reject) => {
        if (error) reject(error);
        
        resolve(`https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${result.container}/${result.name}`);
      }
    );
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

/**
 * Marks the prefix matches blobs for deletion.
 *
 * @param {string} containerName - The container name
 * @param {string} prefix - The prefix of the blobs 
 * @returns {promise}
 * @private
 */
function _dropByPrefix(containerName, prefix) {
  return Reader.searchByPrefix(containerName, prefix)
          .then((list) => {
            const deletedBlobs = [];
            list.forEach((item, index)=>{
              deletedBlobs.push(_drop(containerName, item.name));
            });
            return Promise.all(deletedBlobs);
          });
}

/**
 * Create a container
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
function _addFromText(containerName, blobContent, blobName, options) {
  return new Promise((resolve, reject) => {
    blobService.createBlockBlobFromText(
      containerName, blobName, blobContent, options,
      (error, result, response) => {
        if (error) {
          reject(error);
        }

        resolve(`https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${result.container}/${result.name}`);
      })
  })
}

module.exports = Writer;