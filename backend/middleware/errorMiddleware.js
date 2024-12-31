// unsupported (404) route
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// middleware to handle errors
const errorMiddleware = (err, req, res, next) => {

    if(res.headersSent) {
        return next(err);
    }

    res.status(res.statusCode || 500).json({
        message: err.message || "An Unknown Error Occured",
    });
};

module.exports = { notFound, errorMiddleware };