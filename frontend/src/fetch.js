import axios from 'axios'

let fetchAuth

if (process.env.NODE_ENV === 'development') {
  fetchAuth = axios.create({
    baseURL: `${process.env.REACT_APP_DEV_PROTOCOL}://${
      process.env.REACT_APP_DEV_HOST
    }:${process.env.REACT_APP_DEV_PORT}`,
    headers: { Host: `${process.env.REACT_APP_AUTH_VIRTUAL_HOST}` }
  })
} else {
  fetchAuth = axios.create({
    baseURL: `${process.env.REACT_APP_PROD_PROTOCOL}://${
      process.env.REACT_APP_PROD_HOST
    }:${process.env.REACT_APP_PROD_PORT}`,
    headers: { Host: `${process.env.REACT_APP_AUTH_VIRTUAL_HOST}` }
  })
}

export { fetchAuth }
