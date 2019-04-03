import React, { Component } from 'react'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import './App.css'
import { baseUrl } from './constants'

export default class App extends Component {
  state = {
    email: '',
    password: ''
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    })
  }

  handleLogin = event => {
    event.preventDefault()
    fetch(baseUrl + '')
  }

  handleSignup = event => {
    event.preventDefault()
  }

  render() {
    return (
      <div className="auth">
        <Tabs defaultActiveKey="login" id="auth-tabs">
          <Tab eventKey="login" title="Login">
            <Form onSubmit={this.handleLogin}>
              <Form.Group controlId="email" bsSize="large">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  autoFocus
                  type="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group controlId="password" bsSize="large">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  value={this.state.password}
                  onChange={this.handleChange}
                  type="password"
                />
              </Form.Group>
              <Button
                block
                bsSize="large"
                disabled={!this.validateForm()}
                type="submit"
              >
                Login
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="signup" title="Signup">
            <Form onSubmit={this.handleSignup}>
              <Form.Group controlId="email" bsSize="large">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  autoFocus
                  type="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group controlId="password" bsSize="large">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  value={this.state.password}
                  onChange={this.handleChange}
                  type="password"
                />
              </Form.Group>
              <Button
                block
                bsSize="large"
                disabled={!this.validateForm()}
                type="submit"
              >
                Signup
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </div>
    )
  }
}
