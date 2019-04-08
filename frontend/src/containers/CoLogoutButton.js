import { connect } from 'react-redux'
import logoutUser from '../actions/logoutUser.js'
import LogoutButton from '../components/LogoutButton.js'

const mapDispatchToProps = dispatch => ({
  handleClick: () => dispatch(logoutUser())
})

const CoLogoutButton = connect(
  null,
  mapDispatchToProps
)(LogoutButton)

export default CoLogoutButton
