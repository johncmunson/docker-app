import axios from 'axios'

let fetchAuth

if (process.env.NODE_ENV === 'development') {
  fetchAuth = axios.create({
    baseURL: `${process.env.REACT_APP_DEV_PROTOCOL}://${
      process.env.REACT_APP_DEV_HOST
    }:${process.env.REACT_APP_DEV_PORT}/api/auth`,
    headers: { 'Content-Type': 'application/json' }
  })
} else {
  fetchAuth = axios.create({
    baseURL: `${process.env.REACT_APP_PROD_PROTOCOL}://${
      process.env.REACT_APP_PROD_HOST
    }:${process.env.REACT_APP_PROD_PORT}/api/auth`,
    headers: { 'Content-Type': 'application/json' }
  })
}

export { fetchAuth }
