import http from '@/api/api.js'

class UploadHashService {
  async send(hash, endpoint) {
    const formData = {
      id: '0',
      type: 'hash_data',
      attributes: {
        value: hash,
      },
    }

    return await http.post(endpoint, formData)
  }

  async send_get(hash, endpoint) {
    return await http.get(endpoint + '/' + hash)
  }

  async sendForCreate(hash) {
    return await this.send(hash.slice(2), 'integrations/timestamping/send_tx')
  }

  async sendForCheck(hash) {
    return await this.send_get(
      hash.slice(2),
      'integrations/timestamping/get_timestamp_by_hash',
    )
  }
}

export default new UploadHashService()
