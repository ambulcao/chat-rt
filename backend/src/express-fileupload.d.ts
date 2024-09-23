// src/express-fileupload.d.ts
declare namespace Express {
    interface Request {
      files?: {
        [fieldname: string]: fileUpload.UploadedFile;
      };
    }
  }
  