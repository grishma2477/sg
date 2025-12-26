export const errorHandler = (error, req, res, next) =>{
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong.";
    const data = error.data || {}

    res.status(statusCode).json({
        success:false,
        message,
        data
    });
};