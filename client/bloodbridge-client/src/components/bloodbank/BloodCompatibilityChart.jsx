import { Info } from 'lucide-react'
import { BLOOD_COMPATIBILITY } from '../../utils/bloodCompatibility'

const BloodCompatibilityChart = () => {
  const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center mb-6">
        <Info className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Blood Compatibility Guide</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bloodTypes.map(bloodType => {
            const compatible = BLOOD_COMPATIBILITY[bloodType]
            const isUniversalDonor = bloodType === 'O-'
            const isUniversalRecipient = bloodType === 'AB+'

            return (
              <div
                key={bloodType}
                className={`border rounded-lg p-4 ${
                  isUniversalDonor ? 'border-green-300 bg-green-50' :
                  isUniversalRecipient ? 'border-blue-300 bg-blue-50' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-red-600 mr-2">{bloodType}</span>
                    {isUniversalDonor && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Universal Donor
                      </span>
                    )}
                    {isUniversalRecipient && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Universal Recipient
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Can receive from:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {compatible.map(type => (
                      <span
                        key={type}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          type === bloodType
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        {type}
                        {type === bloodType && ' ✓'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-3">Quick Reference:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span><strong>O-</strong> is the universal donor - can donate to all blood types</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span><strong>AB+</strong> is the universal recipient - can receive from all blood types</span>
            </div>
            <div className="flex items-start">
              <span className="text-red-600 mr-2">•</span>
              <span><strong>Rh+</strong> can receive from both Rh+ and Rh-</span>
            </div>
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span><strong>Rh-</strong> can only receive from Rh-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BloodCompatibilityChart
