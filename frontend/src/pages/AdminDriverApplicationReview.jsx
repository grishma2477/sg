import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, XCircle, Eye, FileText, Car, Calendar, 
  User, Shield, CreditCard, Loader2, Award, Star,
  MapPin, Clock, Phone, Mail, DollarSign
} from 'lucide-react';
import { getToken } from '../utils/CookieUtils';
import './AdminDriverApplicationReview.css'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDriverApplicationReview = ({ application, onClose, onReviewed }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('license');
  const [decision, setDecision] = useState(null);
  const [remarks, setRemarks] = useState('');

  const handleReview = async (approved) => {
    if (!confirm(approved ? '✅ Approve this application?' : '❌ Reject this application?')) {
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/driver-applications/${application.id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved,
          remarks: remarks || (approved ? 'Application approved' : 'Application rejected')
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(approved ? '✅ Application Approved! Driver created with initial badges.' : '❌ Application Rejected');
        onReviewed();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Review error:', error);
      alert('Failed to review application');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'license', label: 'License', icon: FileText },
    { id: 'vehicle', label: 'Vehicle', icon: Car },
    { id: 'documents', label: 'Documents', icon: Shield },
    { id: 'photos', label: 'Photos', icon: Eye },
    { id: 'preferences', label: 'Preferences', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="review-header">
          <div>
            <h2>🚗 Driver Application Review</h2>
            <p>{application.full_name || application.email}</p>
          </div>
          <button onClick={onClose} className="modal-close">
            <X size={28} />
          </button>
        </div>

        {/* Tabs */}
        <div className="review-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`review-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="review-content">
          {/* LICENSE TAB */}
          {activeTab === 'license' && (
            <div className="review-section">
              <h3><FileText size={20} /> License Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>License Number</label>
                  <div>{application.license_number}</div>
                </div>
                <div className="info-item">
                  <label>License Type</label>
                  <div>{application.license_type || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <label>Category</label>
                  <div>{application.license_category}</div>
                </div>
                <div className="info-item">
                  <label>Issued Date</label>
                  <div>{new Date(application.license_issued_date).toLocaleDateString()}</div>
                </div>
                <div className="info-item">
                  <label>Expiry Date</label>
                  <div>{new Date(application.license_expiry_date).toLocaleDateString()}</div>
                </div>
                {application.license_renewed_date && (
                  <div className="info-item">
                    <label>Renewed Date</label>
                    <div>{new Date(application.license_renewed_date).toLocaleDateString()}</div>
                  </div>
                )}
                {application.issuing_authority && (
                  <div className="info-item full">
                    <label>Issuing Authority</label>
                    <div>{application.issuing_authority}</div>
                  </div>
                )}
                {application.years_of_experience && (
                  <div className="info-item">
                    <label>Years of Experience</label>
                    <div>{application.years_of_experience} years</div>
                  </div>
                )}
              </div>

              <div className="document-images">
                <div className="doc-image">
                  <label>License Front</label>
                  <img src={application.license_front_url} alt="License Front" />
                </div>
                {application.license_back_url && (
                  <div className="doc-image">
                    <label>License Back</label>
                    <img src={application.license_back_url} alt="License Back" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VEHICLE TAB */}
          {activeTab === 'vehicle' && (
            <div className="review-section">
              <h3><Car size={20} /> Vehicle Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Vehicle Type</label>
                  <div>{application.vehicle_type}</div>
                </div>
                {application.vehicle_category && (
                  <div className="info-item">
                    <label>Category</label>
                    <div>{application.vehicle_category}</div>
                  </div>
                )}
                <div className="info-item">
                  <label>Make</label>
                  <div>{application.make}</div>
                </div>
                <div className="info-item">
                  <label>Model</label>
                  <div>{application.model}</div>
                </div>
                <div className="info-item">
                  <label>Year</label>
                  <div>{application.year}</div>
                </div>
                <div className="info-item">
                  <label>Color</label>
                  <div>{application.color || 'N/A'}</div>
                </div>
                <div className="info-item full">
                  <label>License Plate</label>
                  <div><strong>{application.license_plate}</strong></div>
                </div>
                {application.vin && (
                  <div className="info-item full">
                    <label>VIN</label>
                    <div>{application.vin}</div>
                  </div>
                )}
                {application.cc && (
                  <div className="info-item">
                    <label>CC (Engine Capacity)</label>
                    <div>{application.cc}</div>
                  </div>
                )}
                {application.transmission_type && (
                  <div className="info-item">
                    <label>Transmission</label>
                    <div>{application.transmission_type}</div>
                  </div>
                )}
                {application.fuel_type && (
                  <div className="info-item">
                    <label>Fuel Type</label>
                    <div>{application.fuel_type}</div>
                  </div>
                )}
                <div className="info-item">
                  <label>Seating Capacity</label>
                  <div>{application.seating_capacity || 4}</div>
                </div>
                <div className="info-item">
                  <label>Air Conditioning</label>
                  <div>{application.has_ac ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>

              <h4>Vehicle Amenities</h4>
              <div className="amenities-list">
                {application.has_dashcam && <span className="amenity-badge">📹 Dashcam</span>}
                {application.has_music && <span className="amenity-badge">🎵 Music System</span>}
                {application.has_water && <span className="amenity-badge">💧 Water Bottles</span>}
                {application.has_charger && <span className="amenity-badge">🔌 Phone Charger</span>}
                {application.is_pet_friendly && <span className="amenity-badge">🐕 Pet Friendly</span>}
                {application.is_wheelchair_accessible && <span className="amenity-badge">♿ Wheelchair Accessible</span>}
                {!application.has_dashcam && !application.has_music && !application.has_water && 
                 !application.has_charger && !application.is_pet_friendly && !application.is_wheelchair_accessible && (
                  <span className="amenity-badge-gray">No amenities selected</span>
                )}
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="review-section">
              <h3><Shield size={20} /> Vehicle Documents</h3>
              
              {/* Registration */}
              <div className="doc-section">
                <h4>Registration</h4>
                <div className="info-grid">
                  {application.registration_number && (
                    <div className="info-item">
                      <label>Registration Number</label>
                      <div>{application.registration_number}</div>
                    </div>
                  )}
                  {application.registration_expiry_date && (
                    <div className="info-item">
                      <label>Expiry Date</label>
                      <div>{new Date(application.registration_expiry_date).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
                <div className="document-images">
                  <div className="doc-image">
                    <label>Registration Document</label>
                    <img src={application.registration_url} alt="Registration" />
                  </div>
                </div>
              </div>

              {/* Blue Book */}
              {(application.blue_book_number || application.blue_book_url) && (
                <div className="doc-section">
                  <h4>Blue Book</h4>
                  <div className="info-grid">
                    {application.blue_book_number && (
                      <div className="info-item">
                        <label>Blue Book Number</label>
                        <div>{application.blue_book_number}</div>
                      </div>
                    )}
                    {application.blue_book_expiry_date && (
                      <div className="info-item">
                        <label>Expiry Date</label>
                        <div>{new Date(application.blue_book_expiry_date).toLocaleDateString()}</div>
                      </div>
                    )}
                    {application.blue_book_renewed_date && (
                      <div className="info-item">
                        <label>Renewed Date</label>
                        <div>{new Date(application.blue_book_renewed_date).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                  {application.blue_book_url && (
                    <div className="document-images">
                      <div className="doc-image">
                        <label>Blue Book Document</label>
                        <img src={application.blue_book_url} alt="Blue Book" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Insurance */}
              <div className="doc-section">
                <h4>Insurance</h4>
                <div className="info-grid">
                  {application.insurance_policy_number && (
                    <div className="info-item">
                      <label>Policy Number</label>
                      <div>{application.insurance_policy_number}</div>
                    </div>
                  )}
                  {application.insurance_expiry_date && (
                    <div className="info-item">
                      <label>Expiry Date</label>
                      <div>{new Date(application.insurance_expiry_date).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
                <div className="document-images">
                  <div className="doc-image">
                    <label>Insurance Document</label>
                    <img src={application.insurance_url} alt="Insurance" />
                  </div>
                </div>
              </div>

              {/* Other Certificates */}
              {(application.fitness_certificate_url || application.emission_certificate_url) && (
                <div className="doc-section">
                  <h4>Additional Certificates</h4>
                  <div className="document-images">
                    {application.fitness_certificate_url && (
                      <div className="doc-image">
                        <label>Fitness Certificate {application.fitness_expiry_date && `(Expiry: ${new Date(application.fitness_expiry_date).toLocaleDateString()})`}</label>
                        <img src={application.fitness_certificate_url} alt="Fitness" />
                      </div>
                    )}
                    {application.emission_certificate_url && (
                      <div className="doc-image">
                        <label>Emission Certificate {application.emission_expiry_date && `(Expiry: ${new Date(application.emission_expiry_date).toLocaleDateString()})`}</label>
                        <img src={application.emission_certificate_url} alt="Emission" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHOTOS TAB */}
          {activeTab === 'photos' && (
            <div className="review-section">
              <h3><Eye size={20} /> Vehicle Photos</h3>
              <div className="vehicle-photos-grid">
                <div className="vehicle-photo">
                  <label>Front View</label>
                  <img src={application.photo_front_url} alt="Front" />
                </div>
                {application.photo_back_url && (
                  <div className="vehicle-photo">
                    <label>Back View</label>
                    <img src={application.photo_back_url} alt="Back" />
                  </div>
                )}
                {application.photo_left_url && (
                  <div className="vehicle-photo">
                    <label>Left View</label>
                    <img src={application.photo_left_url} alt="Left" />
                  </div>
                )}
                {application.photo_right_url && (
                  <div className="vehicle-photo">
                    <label>Right View</label>
                    <img src={application.photo_right_url} alt="Right" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="review-section">
              <h3><MapPin size={20} /> Safety & Preferences</h3>
              
              <h4>Emergency Contact</h4>
              <div className="info-grid">
                {application.emergency_contact_name && (
                  <div className="info-item">
                    <label>Contact Name</label>
                    <div>{application.emergency_contact_name}</div>
                  </div>
                )}
                {application.emergency_contact_number && (
                  <div className="info-item">
                    <label>Contact Number</label>
                    <div>{application.emergency_contact_number}</div>
                  </div>
                )}
              </div>

              <h4>Driver Training</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Training Completed</label>
                  <div>{application.driver_training_completed ? '✅ Yes' : '❌ No'}</div>
                </div>
                {application.training_date && (
                  <div className="info-item">
                    <label>Training Date</label>
                    <div>{new Date(application.training_date).toLocaleDateString()}</div>
                  </div>
                )}
                {application.safety_quiz_score && (
                  <div className="info-item">
                    <label>Safety Quiz Score</label>
                    <div>{application.safety_quiz_score}</div>
                  </div>
                )}
              </div>

              <h4>Work Preferences</h4>
              <div className="info-grid">
                {application.preferred_working_hours && (
                  <div className="info-item">
                    <label>Working Hours</label>
                    <div>{application.preferred_working_hours}</div>
                  </div>
                )}
                {application.preferred_working_areas && (
                  <div className="info-item full">
                    <label>Working Areas</label>
                    <div>{Array.isArray(application.preferred_working_areas) ? application.preferred_working_areas.join(', ') : application.preferred_working_areas}</div>
                  </div>
                )}
                {application.languages_spoken && (
                  <div className="info-item full">
                    <label>Languages Spoken</label>
                    <div>{Array.isArray(application.languages_spoken) ? application.languages_spoken.join(', ') : application.languages_spoken}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAYMENT TAB */}
          {activeTab === 'payment' && (
            <div className="review-section">
              <h3><CreditCard size={20} /> Payment Information</h3>
              <div className="info-grid">
                {application.account_holder_name && (
                  <div className="info-item full">
                    <label>Account Holder Name</label>
                    <div>{application.account_holder_name}</div>
                  </div>
                )}
                {application.bank_name && (
                  <div className="info-item">
                    <label>Bank Name</label>
                    <div>{application.bank_name}</div>
                  </div>
                )}
                {application.bank_branch && (
                  <div className="info-item">
                    <label>Bank Branch</label>
                    <div>{application.bank_branch}</div>
                  </div>
                )}
                {application.bank_account_number && (
                  <div className="info-item full">
                    <label>Account Number</label>
                    <div>{application.bank_account_number}</div>
                  </div>
                )}
                {application.tax_id_number && (
                  <div className="info-item">
                    <label>Tax ID / PAN</label>
                    <div>{application.tax_id_number}</div>
                  </div>
                )}
                {application.payment_method_preference && (
                  <div className="info-item">
                    <label>Payment Method</label>
                    <div>{application.payment_method_preference}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Remarks */}
        <div className="review-remarks">
          <label>Admin Remarks (Optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any comments or notes..."
            rows="3"
          />
        </div>

        {/* Footer Actions */}
        <div className="review-footer">
          <button 
            onClick={() => handleReview(false)}
            disabled={loading}
            className="btn-reject"
          >
            {loading ? <Loader2 className="spinner" size={20} /> : <XCircle size={20} />}
            Reject Application
          </button>
          <button 
            onClick={() => handleReview(true)}
            disabled={loading}
            className="btn-approve"
          >
            {loading ? <Loader2 className="spinner" size={20} /> : <CheckCircle size={20} />}
            Approve & Create Driver
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDriverApplicationReview;