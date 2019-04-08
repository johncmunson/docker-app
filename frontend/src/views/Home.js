import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => (
  <div>
    <div>You are at home.</div>
    <Link to={`work`}>Go to work.</Link>
  </div>
)

export default Home
