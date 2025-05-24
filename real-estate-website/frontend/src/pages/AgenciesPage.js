import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './AgenciesPage.css';

const AgenciesPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/agencies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAgencies(data);
      } else {
        throw new Error('Failed to fetch agencies');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencyClients = async (agencyId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/agencies/${agencyId}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
        setSelectedAgency(agencies.find(a => a.id === agencyId));
      } else {
        throw new Error('Failed to fetch agency clients');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAgencyClick = (agencyId) => {
    if (selectedAgency?.id === agencyId) {
      setSelectedAgency(null);
      setClients([]);
    } else {
      fetchAgencyClients(agencyId);
    }
  };

  if (loading && !agencies.length) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="agencies-page">
      <h1>Real Estate Agencies</h1>
      <div className="agencies-container">
        <div className="agencies-list">
          {agencies.length === 0 ? (
            <div className="no-agencies">No agencies found.</div>
          ) : (
            agencies.map(agency => (
              <div 
                key={agency.id} 
                className={`agency-card ${selectedAgency?.id === agency.id ? 'selected' : ''}`}
                onClick={() => handleAgencyClick(agency.id)}
              >
                <div className="agency-header">
                  {agency.logo_url ? (
                    <img src={agency.logo_url} alt={agency.name} className="agency-logo" />
                  ) : (
                    <div className="agency-logo-placeholder">
                      {agency.name.charAt(0)}
                    </div>
                  )}
                  <h2>{agency.name}</h2>
                </div>
                <div className="agency-details">
                  <p><strong>Contact:</strong> {agency.contact_email}</p>
                  <p><strong>Phone:</strong> {agency.contact_phone}</p>
                  {agency.description && (
                    <p className="agency-description">{agency.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedAgency && (
          <div className="agency-clients">
            <h2>{selectedAgency.name}'s Clients</h2>
            {loading ? (
              <div className="loading">Loading clients...</div>
            ) : clients.length > 0 ? (
              <div className="clients-list">
                {clients.map(client => (
                  <div key={client.id} className="client-card">
                    <h3>{client.first_name} {client.last_name}</h3>
                    <p>{client.email}</p>
                    <p className="client-since">
                      Client since: {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-clients">No clients found for this agency.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgenciesPage; 