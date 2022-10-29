function sendResponse(success, message) {
    return {
        success: success,
        message: message
    };
}

module.exports = sendResponse;
