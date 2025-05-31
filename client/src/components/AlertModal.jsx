import PropTypes from 'prop-types';
import '../css/AlertModal.css'; // We'll create this

const AlertModal = ({ isVisible, title, message, type = 'info', onClose, onConfirm, confirmText }) => {
  if (!isVisible) return null;

  return (
    <div className="alert-modal-backdrop">
      <div className={`alert-modal alert-modal-${type}`}>
        {title && <h2>{title}</h2>}
        <p dangerouslySetInnerHTML={{ __html: message }} />
        <div className="alert-modal-actions">
          {onConfirm && confirmText && (
            <button className="btn-confirm" onClick={onConfirm}>
              {confirmText}
            </button>
          )}
          <button className="btn-close-alert" onClick={onClose}>
            {onConfirm ? 'Cancel' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

AlertModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning', 'loading']),
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
};

export default AlertModal;