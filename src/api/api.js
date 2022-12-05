import axios from 'axios'
import { config } from '@/config'

export default axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-type': 'application/json',
  },
})
