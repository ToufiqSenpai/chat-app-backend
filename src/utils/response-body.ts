import { HttpStatus } from "@nestjs/common"

export class ResponseBody {
  constructor(payload: { data?: any, errors?: any, message?: string, status: HttpStatus }) {
    let statusInfo = null

    switch(payload.status) {
      case 200:
        statusInfo = { status: 200, message: 'OK' }
        break
      case 201: 
        statusInfo = { status: 201, message: 'Created' }
        break
      case 202:
        statusInfo = { status: 202, message: 'Accepted' }
        break
      case 204:
        statusInfo = { status: 204, message: 'No Content' }
        break
      case 400:
        statusInfo = { status: 400, message: 'Bad Request' }
        break
      case 401:
        statusInfo = { status: 401, message: 'Unauthorized' }
        break
      case 403:
        statusInfo = { status: 403, message: 'Forbidden' }
        break
      case 404:
        statusInfo = { status: 204, message: 'No Content' }
        break
      case 405:
        statusInfo = { status: 405, message: 'Method Not Allowed' }
        break
      case 406:
        statusInfo = { status: 406, message: 'Not Accepted' }
        break
      case 409:
        statusInfo = { status: 409, message: 'Conflict' }
        break
      case 415:
        statusInfo = { status: 415, message: 'Unsupported media type' }
        break
      case 422:
        statusInfo = { status: 422, message: 'Unprocessable entity' }
        break
      default:
        statusInfo = { status: 200, message: 'OK' }
        break
    }

    return { 
      ...statusInfo,  
      data: payload.data, 
      errors: payload.errors, 
      message: payload.message ? payload.message : statusInfo.message 
    }
  }
}