import * as fs from 'fs'

interface FilesValidatorOptions {
  path: string
  allowExt?: string[]
  // Max size in bytes
  maxSize?: number
}

export class FilesValidator {
  private files: Array<Express.Multer.File>
  private options: FilesValidatorOptions

  constructor(files: Array<Express.Multer.File>, options: FilesValidatorOptions) {
    this.files = files
    this.options = options
  }

  public validate(): { isValid: boolean, errors: string[] } {
    const errorMessage: string[] = []
    let isValid: boolean = true

    for(const index in this.files) {
      const file = this.files[index]
      errorMessage.push(null)

      if(this.options.allowExt.length > 0 && !(this.options.allowExt.includes(this.getExtension(file.filename)))) {
        errorMessage[index] = 'File type is not allowed'
      }

      if(this.options.maxSize && file.size > this.options.maxSize) {
        errorMessage[index] = 'File is too large'
      }
    }

    for(const error of errorMessage) {
      if(error != null) {
        isValid = false
        break
      }
    }

    return { isValid, errors: errorMessage }
  }

  public deleteAllFiles(): void {
    for(const file of this.files) {
      try {
        fs.unlinkSync(`${this.options.path}/${file.filename}`)
      } catch(error) {
        console.error(error)
      }
    }
  }

  private getExtension(fileName: string): string {
    return fileName.split('.').pop()
  }
}