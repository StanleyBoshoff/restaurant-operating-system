/**
 * Centralized logic for employee compliance and document requirements.
 */

export const getIdentityStatus = (employee) => {
  const identityValue = (employee?.sa_id_number || '').trim();
  const isSouthAfrican = /^\d{13}$/.test(identityValue);
  const isForeignNational = identityValue.length > 0 && !isSouthAfrican;

  return {
    identityValue,
    isSouthAfrican,
    isForeignNational,
    hasIdentity: identityValue.length > 0
  };
};

export const getRequiredDocuments = (employee) => {
  const { identityValue, isSouthAfrican } = getIdentityStatus(employee);

  if (!identityValue) return [];

  if (isSouthAfrican) {
    return [
      { type: 'ID Copy', description: 'Certified copy of the South African ID' },
      { type: 'Tax Certificate', description: 'SARS tax certificate or employment tax record' },
      { type: 'Proof of Address', description: 'Utility bill or lease agreement' }
    ];
  } else {
    return [
      { type: 'Passport', description: 'Certified passport copy' },
      { type: 'Work Permit', description: 'Valid work permit or authorization' },
      { type: 'Visa', description: 'Valid visa or entry permit' },
      { type: 'Tax Certificate', description: 'Tax certificate or tax compliance record' },
      { type: 'Proof of Address', description: 'Utility bill or lease agreement' }
    ];
  }
};

export const calculateCompliance = (employee, uploadedDocuments = []) => {
  const required = getRequiredDocuments(employee);
  if (required.length === 0) return { status: 'Missing', missingCount: 0, totalRequired: 0 };

  const uploadedTypes = new Set(uploadedDocuments.map(doc => doc.document_type));
  const missing = required.filter(req => !uploadedTypes.has(req.type));

  // Check for expiries among uploaded required documents
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

  let hasExpired = false;
  let hasDueSoon = false;

  uploadedDocuments.forEach(doc => {
    if (doc.expiry_date) {
      const expiry = new Date(doc.expiry_date);
      if (expiry < now) hasExpired = true;
      else if (expiry < thirtyDaysFromNow) hasDueSoon = true;
    }
  });

  if (hasExpired) return { status: 'Expired', missingCount: missing.length, totalRequired: required.length };
  if (missing.length > 0) return { status: 'Pending', missingCount: missing.length, totalRequired: required.length };
  if (hasDueSoon) return { status: 'Due Soon', missingCount: 0, totalRequired: required.length };

  return { status: 'Compliant', missingCount: 0, totalRequired: required.length };
};
