import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Info, ArrowRight } from 'lucide-react';
import { DreamService } from '../services/dreamService';
import { DataRecoveryService } from '../services/dataRecoveryService';

/**
 * Data Recovery Modal Component
 * Handles recovery of lost Someday Life data
 */
const DataRecoveryModal = ({ isOpen, onClose, onRecovered }) => {
  const [diagnosis, setDiagnosis] = useState(null);
  const [recoveryData, setRecoveryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('diagnosis'); // 'diagnosis', 'options', 'recovering', 'success', 'failed'

  useEffect(() => {
    if (isOpen) {
      runDiagnosis();
    }
  }, [isOpen]);

  const runDiagnosis = async () => {
    setLoading(true);
    try {
      const diagnosisResult = DataRecoveryService.diagnoseDataState();
      setDiagnosis(diagnosisResult);
      
      // Check if recovery is possible
      const recoverable = DataRecoveryService.recoverSomedayLifeData();
      setRecoveryData(recoverable);
      
      setStep(recoverable ? 'options' : 'failed');
    } catch (error) {
      console.error('Diagnosis failed:', error);
      setStep('failed');
    } finally {
      setLoading(false);
    }
  };

  const performRecovery = async () => {
    setLoading(true);
    setStep('recovering');
    
    try {
      const recovered = DreamService.emergencyRecovery();
      if (recovered) {
        setStep('success');
        localStorage.removeItem('needsEmergencyRecovery');
        setTimeout(() => {
          onRecovered && onRecovered(recovered);
          onClose();
        }, 2000);
      } else {
        setStep('failed');
      }
    } catch (error) {
      console.error('Recovery failed:', error);
      setStep('failed');
    } finally {
      setLoading(false);
    }
  };

  const formatDiagnosisData = (data) => {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Data Recovery Center</h2>
                <p className="text-gray-600">We detected missing Someday Life data and are attempting recovery</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Content based on step */}
          {step === 'diagnosis' && (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Data State</h3>
              <p className="text-gray-600">Checking localStorage for recoverable Someday Life data...</p>
            </div>
          )}

          {step === 'options' && recoveryData && (
            <div>
              <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Recovery Data Found!</h3>
                    <p className="text-green-700">
                      We found your Someday Life data in localStorage and can restore it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview of recoverable data */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Preview of Recoverable Data:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Title:</span>
                    <p className="text-gray-900">{recoveryData.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Target Amount:</span>
                    <p className="text-gray-900">${recoveryData.target_amount?.toLocaleString() || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Annual Expenses:</span>
                    <p className="text-gray-900">${recoveryData.annual_expenses?.toLocaleString() || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Recovery Source:</span>
                    <p className="text-gray-900">{recoveryData.recoverySource}</p>
                  </div>
                  {recoveryData.location && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Location:</span>
                      <p className="text-gray-900">{recoveryData.location}</p>
                    </div>
                  )}
                  {recoveryData.description && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">Description:</span>
                      <p className="text-gray-900">{recoveryData.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={performRecovery}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Restore My Someday Life
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Skip Recovery
                </button>
              </div>
            </div>
          )}

          {step === 'recovering' && (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Restoring Data</h3>
              <p className="text-gray-600">Rebuilding your Someday Life from recovered data...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recovery Successful!</h3>
              <p className="text-gray-600 mb-4">Your Someday Life has been restored and will appear on your dashboard.</p>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-green-800 text-sm">
                  🎉 Data protection is now active to prevent future losses.
                </p>
              </div>
            </div>
          )}

          {step === 'failed' && (
            <div>
              <div className="text-center py-6 mb-6">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Recoverable Data Found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any Someday Life data to recover. This might mean the data was never saved or has been permanently deleted.
                </p>
              </div>

              {diagnosis && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Diagnostic Information:</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Found Keys:</span>
                        <p className="text-gray-900">{diagnosis.foundKeys?.length || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Dreams Total:</span>
                        <p className="text-gray-900">{diagnosis.dreams?.total || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Someday Life Goals:</span>
                        <p className="text-gray-900">{diagnosis.dreams?.somedayLifeGoals?.length || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Recent Activity:</span>
                        <p className="text-gray-900">{diagnosis.dreams?.recentlyCreated?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => window.location.href = '#someday-life-builder'}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Create New Someday Life
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Debug mode for development */}
          {diagnosis && window.location.search.includes('debug') && (
            <div className="mt-6 border-t pt-6">
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-medium text-gray-900 cursor-pointer">Debug Information</summary>
                <pre className="mt-4 text-xs text-gray-600 overflow-auto max-h-60">
                  {formatDiagnosisData(diagnosis)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataRecoveryModal;
