import http from '@/api/api.js'

class UploadFileService {
  async uploadFile(file, endpoint) {
    return await http.post(endpoint, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async uploadFileForCreate(file) {
    return await this.uploadFile(
      file,
      'integrations/timestamping/get_hash_send_tx',
    )
  }

  async uploadFileForCheck(file) {
    return await this.uploadFile(
      file,
      'integrations/timestamping/get_timestamp_by_data',
    )
  }
}

export default new UploadFileService()
