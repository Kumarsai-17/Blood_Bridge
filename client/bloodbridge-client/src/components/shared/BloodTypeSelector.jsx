import { Droplets, Check } from 'lucide-react'

const BloodTypeSelector = ({ value, onChange, disabled = false }) => {
  const bloodTypes = [
    { type: 'A+', color: 'border-blue-500 bg-blue-50 text-blue-700' },
    { type: 'A-', color: 'border-blue-500 bg-blue-50 text-blue-700' },
    { type: 'B+', color: 'border-green-500 bg-green-50 text-green-700' },
    { type: 'B-', color: 'border-green-500 bg-green-50 text-green-700' },
    { type: 'O+', color: 'border-red-500 bg-red-50 text-red-700' },
    { type: 'O-', color: 'border-red-500 bg-red-50 text-red-700' },
    { type: 'AB+', color: 'border-purple-500 bg-purple-50 text-purple-700' },
    { type: 'AB-', color: 'border-purple-500 bg-purple-50 text-purple-700' }
  ]

  return (
    <div className="space-y-2">
      {/* Single horizontal bar with all blood types */}
      <div className="flex flex-wrap gap-2">
        {bloodTypes.map((bloodType) => (
          <button
            key={bloodType.type}
            type="button"
            disabled={disabled}
            onClick={() => onChange(bloodType.type)}
            className={`
              relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border-2 
              font-bold text-sm sm:text-base transition-all duration-200
              flex items-center gap-2
              ${value === bloodType.type 
                ? `${bloodType.color} shadow-md scale-105` 
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              } 
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer active:scale-95'}
            `}
          >
            {value === bloodType.type && (
              <Check className="w-4 h-4 font-bold" />
            )}
            <span>{bloodType.type}</span>
          </button>
        ))}
      </div>
      
      {/* Info text */}
      {value && (
        <p className="text-xs sm:text-sm text-gray-600 px-1">
          <span className="font-semibold text-gray-900">{value}</span> - {' '}
          {value === 'O-' ? 'Universal donor (can donate to all)' :
           value === 'AB+' ? 'Universal recipient (can receive from all)' :
           value === 'O+' ? 'Can donate to O+, A+, B+, AB+' :
           value === 'A+' ? 'Can donate to A+, AB+' :
           value === 'A-' ? 'Can donate to A+, A-, AB+, AB-' :
           value === 'B+' ? 'Can donate to B+, AB+' :
           value === 'B-' ? 'Can donate to B+, B-, AB+, AB-' :
           value === 'AB-' ? 'Can donate to AB+, AB-' :
           'Compatible with specific blood types'}
        </p>
      )}
    </div>
  )
}

export default BloodTypeSelector