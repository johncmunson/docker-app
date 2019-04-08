import React, { Component } from 'react'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import { fetchAuth } from '../fetch'
import './LoginForm.css'

export default class LoginForm extends Component {
  state = {
    loginEmail: '',
    loginPassword: '',
    signupEmail: '',
    signupPassword: '',
    signingUp: false,
    successfulSignup: false
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

  handleSignup = async event => {
    event.preventDefault()
    this.setState({ signingUp: true })
    try {
      await fetchAuth({
        method: 'post',
        url: '/signup',
        data: {
          email: this.state.signupEmail,
          password: this.state.signupPassword
        }
      })
      this.setState({ signingUp: false, successfulSignup: true })
    } catch (error) {
      this.setState({ signingUp: false })
      console.log(error)
    }
  }

  render() {
    return (
      <div className="auth">
        <Tabs defaultActiveKey="login" id="auth-tabs">
          <Tab eventKey="login" title="Login">
            <Form>
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
                disabled={!this.validateForm('login') || this.props.loggingIn}
                type="button"
                onClick={() =>
                  this.props.handleLogin(
                    this.state.loginEmail,
                    this.state.loginPassword
                  )
                }
              >
                {this.props.loggingIn ? (
                  <Spinner animation="border" size="sm" as="span" />
                ) : (
                  <span>Login</span>
                )}
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="signup" title="Signup">
            <Form>
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
                disabled={
                  !this.validateForm('signup') ||
                  this.state.signingUp ||
                  this.state.successfulSignup
                }
                type="button"
                onClick={this.handleSignup}
              >
                {this.state.signingUp ? (
                  <Spinner animation="border" size="sm" as="span" />
                ) : (
                  <span>Signup</span>
                )}
              </Button>
              {this.state.successfulSignup && (
                <div>Please check your email to verify your account</div>
              )}
            </Form>
          </Tab>
        </Tabs>
      </div>
    )
  }
}
