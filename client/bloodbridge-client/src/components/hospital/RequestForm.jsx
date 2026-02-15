import { useState } from 'react'
import { Calendar, MapPin, AlertTriangle, FileText } from 'lucide-react'
import BloodTypeSelector from '../shared/BloodTypeSelector'
import { validateUnits } from '../../utils/validations'
import { URGENCY_LEVELS } from '../../utils/constants'

const RequestForm = ({ onSubmit, loading = false, initialData = null }) => {
  const [formData, setFormData] = useState({
    bloodGroup: initialData?.bloodGroup || '',
    unitsNeeded: initialData?.unitsNeeded || '',
    urgency: initialData?.urgency || 'medium',
    requiredDate: initialData?.requiredDate || '',
    description: initialData?.description || '',
    patientName: initialData?.patientName || '',
    patientAge: initialData?.patientAge || '',
    contactPerson: initialData?.contactPerson || '',
    contactPhone: initialData?.contactPhone || ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood type is required'
    }

    if (!formData.unitsNeeded || !validateUnits(parseInt(formData.unitsNeeded))) {
      newErrors.unitsNeeded = 'Please enter a valid number of units (1-100)'
    }

    if (!formData.requiredDate) {
      newErrors.requiredDate = 'Required date is required'
    } else {
      const selectedDate = new Date(formData.requiredDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.requiredDate = 'Required date cannot be in the past'
      }
    }

    if (!formData.patientName?.trim()) {
      newErrors.patientName = 'Patient name is required'
    }

    if (!formData.patientAge || formData.patientAge < 1 || formData.patientAge > 120) {
      newErrors.patientAge = 'Please enter a valid age'
    }

    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = 'Contact person is required'
    }

    if (!formData.contactPhone?.trim()) {
      newErrors.contactPhone = 'Contact phone is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        unitsNeeded: parseInt(formData.unitsNeeded),
        patientAge: parseInt(formData.patientAge)
      })
    }
  }

  const urgencyOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Blood Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Blood Type Required *
        </label>
        <BloodTypeSelector
          value={formData.bloodGroup}
          onChange={(value) => handleChange('bloodGroup', value)}
        />
        {errors.bloodGroup && (
          <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>
        )}
      </div>

      {/* Units and Urgency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Units Needed *
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.unitsNeeded}
            onChange={(e) => handleChange('unitsNeeded', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter number of units"
          />
          {errors.unitsNeeded && (
            <p className="mt-1 text-sm text-red-600">{errors.unitsNeeded}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Urgency Level *
          </label>
          <select
            value={formData.urgency}
            onChange={(e) => handleChange('urgency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {urgencyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Required Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Required By *
        </label>
        <input
          type="datetime-local"
          value={formData.requiredDate}
          onChange={(e) => handleChange('requiredDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        {errors.requiredDate && (
          <p className="mt-1 text-sm text-red-600">{errors.requiredDate}</p>
        )}
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient Name *
          </label>
          <input
            type="text"
            value={formData.patientName}
            onChange={(e) => handleChange('patientName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter patient name"
          />
          {errors.patientName && (
            <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient Age *
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={formData.patientAge}
            onChange={(e) => handleChange('patientAge', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter patient age"
          />
          {errors.patientAge && (
            <p className="mt-1 text-sm text-red-600">{errors.patientAge}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Person *
          </label>
          <input
            type="text"
            value={formData.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter contact person name"
          />
          {errors.contactPerson && (
            <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Phone *
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter contact phone number"
          />
          {errors.contactPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Additional Details
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Provide any additional information about the request..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : initialData ? 'Update Request' : 'Submit Request'}
        </button>
      </div>
    </form>
  )
}

export default RequestForm