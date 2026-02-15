import { Droplets } from 'lucide-react'

const BloodTypeSelector = ({ value, onChange, disabled = false }) => {
  const bloodTypes = [
    { type: 'O+', color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' },
    { type: 'O-', color: 'bg-red-200 text-red-900 border-red-300 hover:bg-red-300' },
    { type: 'A+', color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' },
    { type: 'A-', color: 'bg-blue-200 text-blue-900 border-blue-300 hover:bg-blue-300' },
    { type: 'B+', color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' },
    { type: 'B-', color: 'bg-green-200 text-green-900 border-green-300 hover:bg-green-300' },
    { type: 'AB+', color: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200' },
    { type: 'AB-', color: 'bg-purple-200 text-purple-900 border-purple-300 hover:bg-purple-300' }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {bloodTypes.map((bloodType) => (
          <button
            key={bloodType.type}
            type="button"
            disabled={disabled}
            onClick={() => onChange(bloodType.type)}
            className={`
              px-4 py-3 rounded-xl border-2 flex items-center justify-center
              font-semibold text-sm transition-all duration-200
              ${value === bloodType.type 
                ? `${bloodType.color} border-opacity-100 ring-2 ring-offset-2 ring-blue-500 scale-105 shadow-md` 
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              } 
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
            `}
          >
            <Droplets className="w-4 h-4 mr-2" />
            <span>{bloodType.type}</span>
          </button>
        ))}
      </div>
      
      {value && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Selected: {value}
              </p>
              <p className="text-xs text-blue-700">
                {value === 'O-' ? 'Universal donor - Can donate to all blood types' :
                 value === 'AB+' ? 'Universal recipient - Can receive from all blood types' :
                 value === 'O+' ? 'Can donate to O+, A+, B+, AB+' :
                 value === 'A+' ? 'Can donate to A+, AB+' :
                 value === 'A-' ? 'Can donate to A+, A-, AB+, AB-' :
                 value === 'B+' ? 'Can donate to B+, AB+' :
                 value === 'B-' ? 'Can donate to B+, B-, AB+, AB-' :
                 value === 'AB-' ? 'Can donate to AB+, AB-' :
                 'Compatible with specific blood types'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BloodTypeSelector