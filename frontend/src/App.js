import React, { Component } from 'react'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import './App.css'
import { fetchAuth } from './fetch'

export default class App extends Component {
  state = {
    loginEmail: '',
    loginPassword: '',
    signupEmail: '',
    signupPassword: ''
  }

  validateForm(formName) {
    return (
      this.state[formName + 'Email'].length > 0 &&
      this.state[formName + 'Password'].length > 0
    )
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    })
  }

  handleLogin = event => {
    event.preventDefault()
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
              <Form.Group controlId="loginEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  autoFocus
                  type="email"
                  value={this.state.loginEmail}
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group controlId="loginPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  value={this.state.loginPassword}
                  onChange={this.handleChange}
                  type="password"
                />
              </Form.Group>
              <Button
                block
                size="large"
                disabled={!this.validateForm('login')}
                type="submit"
              >
                Login
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="signup" title="Signup">
            <Form onSubmit={this.handleSignup}>
              <Form.Group controlId="signupEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  autoFocus
                  type="email"
                  value={this.state.signupEmail}
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group controlId="signupPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  value={this.state.signupPassword}
                  onChange={this.handleChange}
                  type="password"
                />
              </Form.Group>
              <Button
                block
                size="large"
                disabled={!this.validateForm('signup')}
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
