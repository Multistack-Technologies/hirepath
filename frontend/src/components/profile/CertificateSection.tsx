// components/profile/CertificateSection.tsx
import { useState, useEffect } from 'react';
import { UserProfile, Certificate } from '@/types';
import Button from '@/components/Button';
import CertificateModal from './CertificateModal';
import api from '@/lib/api';
import { FiEdit2, FiTrash2, FiAward, FiExternalLink, FiCheck, FiX } from 'react-icons/fi';
import { FaCertificate } from "react-icons/fa";

interface CertificateSectionProps {
  profile: UserProfile;
}

export default function CertificateSection({ profile }: CertificateSectionProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCertificateId, setHoveredCertificateId] = useState<number | null>(null);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/certificates/user/');
      setCertificates(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch certificates:', error);
      setError(error.response?.data?.error || 'Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleAddCertificate = () => {
    setEditingCertificate(null);
    setIsModalOpen(true);
  };

  const handleEditCertificate = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setIsModalOpen(true);
  };

  const handleDeleteCertificate = async (certificateId: number) => {
    if (!confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    try {
      await api.delete(`/certificates/${certificateId}/`);
      setCertificates(prev => prev.filter(cert => cert.id !== certificateId));
    } catch (error: any) {
      console.error('Failed to delete certificate:', error);
      alert('Failed to delete certificate');
    }
  };

  const handleCertificateAdded = (certificate: Certificate) => {
    if (editingCertificate) {
      // Update existing certificate
      setCertificates(prev => 
        prev.map(cert => cert.id === certificate.id ? certificate : cert)
      );
    } else {
      // Add new certificate
      setCertificates(prev => [certificate, ...prev]);
    }
    setIsModalOpen(false);
    setEditingCertificate(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (certificate: Certificate) => {
    const isExpired = certificate.status === 'EXPIRED';
    const isVerified = certificate.is_verified;
    
    return (
      <div className="flex items-center space-x-2 mt-2">
        {isVerified ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheck className="w-3 h-3 mr-1" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiX className="w-3 h-3 mr-1" />
            Unverified
          </span>
        )}
        {isExpired && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Expired
          </span>
        )}
        {certificate.is_permanent && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Permanent
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-700">Certificates</h2>
          <Button variant="secondary" size="md" disabled>
            Loading...
          </Button>
        </div>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
                    <div className="text-xl font-semibold text-purple-700 flex space-x-1 items-center">   <FaCertificate  className="w-6 h-6" />
                    <h2>Education</h2></div>
          <Button variant="secondary" size="md" onClick={handleAddCertificate}>
            + ADD CERTIFICATE
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={fetchCertificates}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        )}
        
        <div className="space-y-4">
          {certificates.length > 0 ? (
            certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="border-l-4 border-green-500 pl-4 py-3 group hover:bg-gray-50 rounded-r transition-colors duration-200 relative"
                onMouseEnter={() => setHoveredCertificateId(certificate.id)}
                onMouseLeave={() => setHoveredCertificateId(null)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {certificate.provider.name}
                        </h3>
                        {certificate.credential_id && (
                          <p className="text-sm text-gray-600 mt-1">
                            ID: {certificate.credential_id}
                          </p>
                        )}
                      </div>
                      {certificate.score && (
                        <div className="text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            Score: {certificate.score}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Issued: {formatDate(certificate.issue_date)}
                      {certificate.expiration_date && !certificate.is_permanent && (
                        <> · Expires: {formatDate(certificate.expiration_date)}</>
                      )}
                    </p>
                    
                    {getStatusBadge(certificate)}
                    
                    {certificate.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        {certificate.notes}
                      </p>
                    )}
                    
                    {certificate.certificate_url && (
                      <a
                        href={certificate.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <FiExternalLink className="w-4 h-4 mr-1" />
                        View Certificate
                      </a>
                    )}
                  </div>
                  
                  {/* Action Icons - Only show when hovering over the certificate item */}
                  {hoveredCertificateId === certificate.id && (
                    <div className="flex space-x-2 ml-4">
                      {/* Edit Button with Icon and Tooltip */}
                      <div className="relative group">
                        <button
                          onClick={() => handleEditCertificate(certificate)}
                          className="flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                          Edit Certificate
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                      
                      {/* Delete Button with Icon and Tooltip */}
                      <div className="relative group">
                        <button
                          onClick={() => handleDeleteCertificate(certificate.id)}
                          className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                          Delete Certificate
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-3">
                <FiAward className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500 mb-2">No certificates added yet.</p>
              <p className="text-sm text-gray-400">
                Add your professional certificates to enhance your profile.
              </p>
            </div>
          )}
        </div>
        
        {certificates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} added
            </p>
          </div>
        )}
      </div>

      <CertificateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCertificate(null);
        }}
        onCertificateAdded={handleCertificateAdded}
        existingCertificate={editingCertificate}
      />
    </>
  );
}