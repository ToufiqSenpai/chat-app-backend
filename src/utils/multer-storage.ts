import { diskStorage } from "multer"
import uuid from "./uuid"

export function multerStorage(path: string) {
  return {
    storage: diskStorage({
      destination: path,
      filename: (req, file, callback) => {
        const ext = file.originalname.split('.').slice(-1)
        const newFileName = `${uuid()}.${ext}`

        callback(null, newFileName)
      }
    })
  }
}