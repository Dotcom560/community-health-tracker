import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { analyzeSymptoms } from '../services/api';

const SymptomChecker = () => {
  const [formData, setFormData] = useState({
    symptoms_text: '',
    temperature: '',
    duration_days: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeSymptoms(formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationBadge = (recommendation) => {
    const variants = {
      'home': 'success',
      'clinic': 'warning',
      'emergency': 'danger'
    };
    
    const labels = {
      'home': '🏠 Rest at Home',
      'clinic': '🏥 Visit Clinic',
      'emergency': '🚨 Emergency Care'
    };
    
    return (
      <Badge bg={variants[recommendation]} className="p-3 fs-6">
        {labels[recommendation] || recommendation}
      </Badge>
    );
  };

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow">
            <Card.Header as="h4" className="bg-primary text-white">
              🏥 Symptom Checker
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Describe your symptoms *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="symptoms_text"
                    value={formData.symptoms_text}
                    onChange={handleChange}
                    placeholder="Example: I have fever, headache, and body pain for 2 days..."
                    required
                  />
                  <Form.Text className="text-muted">
                    Be as detailed as possible about your symptoms.
                  </Form.Text>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Temperature (°C) (optional)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        placeholder="37.5"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Duration (days) (optional)</Form.Label>
                      <Form.Control
                        type="number"
                        name="duration_days"
                        value={formData.duration_days}
                        onChange={handleChange}
                        placeholder="2"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Analyzing...</span>
                    </>
                  ) : (
                    'Check Symptoms'
                  )}
                </Button>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-4">
                  {error}
                </Alert>
              )}

              {result && (
                <div className="mt-4">
                  <hr />
                  
                  <h5 className="mb-3">Analysis Results</h5>
                  
                  <div className="mb-3">
                    {getRecommendationBadge(result.triage_result.recommendation)}
                    <span className="ms-2">
                      Confidence: {(result.triage_result.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  {result.triage_result.possible_condition && (
                    <Alert variant="info" className="mb-3">
                      <strong>Possible Condition:</strong> {result.triage_result.possible_condition}
                    </Alert>
                  )}

                  <Card className="mb-3 bg-light">
                    <Card.Body>
                      <h6>AI Analysis:</h6>
                      <p className="mb-0">{result.triage_result.ai_analysis}</p>
                    </Card.Body>
                  </Card>

                  {result.medication_recommendations && (
                    <>
                      <h6 className="mb-2">💊 Medication Suggestions:</h6>
                      <Alert variant="warning" className="mb-3">
                        <small>
                          <strong>IMPORTANT:</strong> {result.medication_recommendations.disclaimer}
                        </small>
                      </Alert>
                      
                      {result.medication_recommendations.medications.map((med, index) => (
                        <Card key={index} className="mb-2">
                          <Card.Body>
                            <h6>{med.name}</h6>
                            <p className="mb-1"><small>{med.reason}</small></p>
                            {med.dosage_note && (
                              <p className="mb-0 text-muted">
                                <small>💊 {med.dosage_note}</small>
                              </p>
                            )}
                          </Card.Body>
                        </Card>
                      ))}
                    </>
                  )}

                  <hr />
                  <small className="text-muted">
                    Analysis method: {result.analysis_method === 'ml_model' ? 'AI Model' : 'Rule-based'}
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SymptomChecker;