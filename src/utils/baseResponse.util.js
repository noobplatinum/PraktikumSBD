const baseResponse = (res, success, status, message, payload) => {
    res.status(status).json({
        success,
        message,
        payload
    });
}

module.exports = baseResponse;