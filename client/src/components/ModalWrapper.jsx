// ModalWrapper.jsx

import PropTypes from 'prop-types'
import BtnClose from './BtnClose'
import '../css/Login.css'
import '../css/BtnClose.css'
import '../css/LandingPage.css'
import '../css/fonts.css'

const ModalWrapper = ({ children, isVisible, toggleModal }) => {
  if (!isVisible) return null

  return (
    <div className='modal-backdrop'>
      <div className='modal'>
        {children}
        <BtnClose onClick={toggleModal} />
      </div>
    </div>
  )
}

ModalWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  isVisible: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
}

export default ModalWrapper
