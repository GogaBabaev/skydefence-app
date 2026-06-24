// Minimal type stubs for multer — avoids a devDependency on @types/multer
// while keeping the compiler happy in the build stage.

declare module 'multer' {
  import { Request } from 'express';

  type CB<T> = (error: Error | null, result: T) => void;

  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  interface DiskStorageOptions {
    destination?: string | ((req: Request, file: File, cb: CB<string>) => void);
    filename?: (req: Request, file: File, cb: CB<string>) => void;
  }

  interface StorageEngine {}

  function diskStorage(options: DiskStorageOptions): StorageEngine;

  export { diskStorage };
}

declare global {
  namespace Express {
    namespace Multer {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}
