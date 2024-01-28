// class AppError extends Error {

//     constructor(message, statusCode){
//         super(message);  //Default class only accepts messages as arguments

//         this.statusCode = statusCode;
//         this.status = `${statusCode}`.startsWith('4')?"Fail":"error";  //checking if status code starts with 4 then return fail otherwise return error
//         this.isOperational = true

//         Error.captureStackTrace(this, this.constructor)
//         //when a new object is created it will not reflected in the stack



//     }
// }

// module.exports = AppError;


class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
  
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = AppError;