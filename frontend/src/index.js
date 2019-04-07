import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Root from './Root'
import configureStore from './store/configureStore.js'

const store = configureStore()

ReactDOM.render(<Root store={store} />, document.getElementById('root'))
