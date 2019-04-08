import React, { Component } from 'react'
import { Box, Tab, Tabs, Form, FormField, Button } from 'grommet'
import { fetchAuth } from '../fetch'

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
      <Box
        direction="row-responsive"
        justify="center"
        align="center"
        pad="xlarge"
      >
        <Tabs height="medium" alignSelf="center">
          <Tab title="Login">
            <Box pad="large" align="center" round>
              <Form>
                <FormField
                  id="loginEmail"
                  type="email"
                  name="email"
                  label="Email"
                  value={this.state.loginEmail}
                  onChange={this.handleChange}
                />
                <FormField
                  id="loginPassword"
                  type="password"
                  name="password"
                  label="Password"
                  value={this.state.loginPassword}
                  onChange={this.handleChange}
                />
                <Button
                  type="button"
                  primary
                  disabled={!this.validateForm('login') || this.props.loggingIn}
                  onClick={() =>
                    this.props.handleLogin(
                      this.state.loginEmail,
                      this.state.loginPassword
                    )
                  }
                >
                  <Box pad="small" direction="row" align="center" gap="small">
                    {this.props.loggingIn ? (
                      <span>Loading...</span>
                    ) : (
                      <span>Login</span>
                    )}
                  </Box>
                </Button>
              </Form>
            </Box>
          </Tab>
          <Tab title="Signup">
            <Box pad="large" align="center" round>
              <Form>
                <FormField
                  id="signupEmail"
                  type="email"
                  name="email"
                  label="Email"
                  value={this.state.signupEmail}
                  onChange={this.handleChange}
                />
                <FormField
                  id="signupPassword"
                  type="password"
                  name="password"
                  label="Password"
                  value={this.state.signupPassword}
                  onChange={this.handleChange}
                />
                <Button
                  type="button"
                  primary
                  disabled={
                    !this.validateForm('signup') ||
                    this.state.signingUp ||
                    this.state.successfulSignup
                  }
                  onClick={this.handleSignup}
                >
                  <Box pad="small" direction="row" align="center" gap="small">
                    {this.state.signingUp ? (
                      <div>Loading...</div>
                    ) : (
                      <span>Signup</span>
                    )}
                  </Box>
                </Button>
                {this.state.successfulSignup && (
                  <div>Please check your email to verify your account.</div>
                )}
              </Form>
            </Box>
          </Tab>
        </Tabs>
      </Box>
    )
  }
}
