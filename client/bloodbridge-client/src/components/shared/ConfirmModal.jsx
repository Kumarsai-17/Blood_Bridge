import { CheckCircle, X, AlertCircle } from 'lucide-react'
import { Button } from '../ui/core'
import { useEffect, useState } from 'react'

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'success'
  clickPosition = null // { x, y } coordinates
}) => {
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })

  useEffect(() => {
    if (isOpen && clickPosition) {
      // Position modal: horizontally centered, vertically at button level (slightly above)
      const scrollY = window.scrollY || window.pageYOffset
      const adjustedY = clickPosition.y + scrollY - 150 // Move up by 150px
      
      setPosition({
        top: `${adjustedY}px`,
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute'
      })
    } else {
      // Default center position
      setPosition({ 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        position: 'fixed'
      })
    }
  }, [isOpen, clickPosition])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />
      case 'danger':
        return <X className="w-12 h-12 text-red-600" />
      default:
        return <AlertCircle className="w-12 h-12 text-orange-600" />
    }
  }

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100'
      case 'danger':
        return 'bg-red-100'
      default:
        return 'bg-orange-100'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700'
      case 'danger':
        return 'bg-red-600 hover:bg-red-700'
      default:
        return 'bg-orange-600 hover:bg-orange-700'
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ position: 'fixed' }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 mx-4 animate-scale-in"
      >
        <div className={`flex items-center justify-center w-16 h-16 ${getIconBg()} rounded-full mx-auto mb-4`}>
          {getIcon()}
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
          {message}
        </p>
        <div className="flex gap-3">
          {cancelText && (
            <Button 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClose()
              }}
              variant="outline" 
              className="flex-1 h-12 rounded-xl"
            >
              {cancelText}
            </Button>
          )}
          <Button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onConfirm()
            }}
            className={`${cancelText ? 'flex-1' : 'w-full'} h-12 rounded-xl text-white ${getButtonColor()}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
