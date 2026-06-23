import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/apiClient';

const PaymentMethodsPage = () => {
  const [methods, setMethods] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchMethods = async () => {
    try {
      const res = await apiRequest('/api/payments/methods');
      setMethods(res.data || []);
    } catch (err) {
      console.error('Fetch methods error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      setProvidersLoading(true);

      const res = await apiRequest('/api/payments/providers');
      setProviders(res.data || []);
    } catch (err) {
      console.error('Fetch providers error:', err);
      setProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const setDefault = async (id) => {
    try {
      await apiRequest(`/api/payments/methods/${id}/default`, {
        method: 'PATCH'
      });

      fetchMethods();
    } catch (err) {
      console.error('Set default error:', err);
    }
  };

  const addMethod = async () => {
    if (!selectedProvider) {
      alert('Select a payment method');
      return;
    }

    try {
      await apiRequest('/api/payments/methods', {
        method: 'POST',
        body: JSON.stringify({
          providerId: selectedProvider.id,
          details: {
            phone: '9800000000'
          }
        })
      });

      setShowModal(false);
      setSelectedProvider(null);
      fetchMethods();
    } catch (err) {
      console.error('Add method error:', err);
    }
  };


  return (
    <div style={{ padding: '1rem', maxWidth: '500px', margin: '0 auto', color: 'white' }}>
      <h2>Payment Methods</h2>

      {loading && <p>Loading...</p>}

      {!loading && methods.length === 0 && (
        <p style={{ color: '#888' }}>No payment methods added</p>
      )}

      {/* ================= METHODS ================= */}
      {methods.map((m) => (
        <div
          key={m.id}
          onClick={() => setDefault(m.id)}
          style={{
            padding: '1rem',
            marginBottom: '0.75rem',
            borderRadius: '12px',
            border: m.is_default ? '2px solid #6366f1' : '1px solid #333',
            background: m.is_default ? 'rgba(99,102,241,0.15)' : '#111',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div>{m.provider_name}</div>
            <small style={{ color: '#888' }}>{m.details?.phone || '••••'}</small>
          </div>

          {m.is_default && <span style={{ color: '#6366f1' }}>DEFAULT</span>}
        </div>
      ))}

      {/* ================= ADD BUTTON ================= */}
      <button onClick={openModal} style={{
        width: '100%',
        padding: '1rem',
        borderRadius: '12px',
        background: '#6366f1',
        color: 'white',
        marginTop: '1rem',
        cursor: 'pointer'
      }}>
        + Add Payment Method
      </button>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#111',
            width: '90%',
            maxWidth: '400px',
            borderRadius: '16px',
            padding: '1.5rem'
          }}>
            <h3>Select Payment Method</h3>

            {/* LOADING */}
            {providersLoading && <p>Loading providers...</p>}

            {/* EMPTY */}
            {!providersLoading && providers.length === 0 && (
              <p style={{ color: '#888' }}>No providers available</p>
            )}

            {/* LIST */}
            {!providersLoading && providers.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProvider(p)}
                style={{
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  borderRadius: '10px',
                  border: selectedProvider?.id === p.id
                    ? '2px solid #6366f1'
                    : '1px solid #333',
                  background: selectedProvider?.id === p.id
                    ? 'rgba(99,102,241,0.2)'
                    : '#111',
                  cursor: 'pointer'
                }}
              >
                {p.provider_name}
              </div>
            ))}

            <button onClick={addMethod} style={{
              width: '100%',
              padding: '1rem',
              marginTop: '1rem',
              background: '#6366f1',
              color: 'white',
              borderRadius: '10px'
            }}>
              Add
            </button>

            <button onClick={() => {
              setShowModal(false);
              setSelectedProvider(null);
            }} style={{
              width: '100%',
              padding: '1rem',
              marginTop: '0.5rem',
              background: '#333',
              color: 'white',
              borderRadius: '10px'
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsPage;