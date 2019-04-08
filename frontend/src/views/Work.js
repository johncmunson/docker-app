import React from 'react'
import { Link } from 'react-router-dom'

const Work = () => (
  <div>
    <div>You are at work.</div>
    <Link to={`home`}>Go home.</Link>
  </div>
)

export default Work
