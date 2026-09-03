import React, { useState } from 'react';

const DOC_FORMS = {
  fir: {
    title: 'FIR Application',
    icon: '🚨',
    fields: [
      { key: 'complainant_name', label: 'Complainant Name / शिकायतकर्ता का नाम', placeholder: 'Full name', required: true },
      { key: 'complainant_address', label: 'Address / पता', placeholder: 'Complete address', required: true },
      { key: 'complainant_phone', label: 'Phone / फ़ोन', placeholder: '10 digit mobile', required: true },
      { key: 'incident_date', label: 'Date of Incident / घटना की तारीख', type: 'date', required: true },
      { key: 'incident_place', label: 'Place of Incident / घटना स्थल', placeholder: 'Full address', required: true },
      { key: 'accused_name', label: 'Accused Name / आरोपी का नाम', placeholder: 'Name (if known)' },
      { key: 'incident_description', label: 'Incident Description / घटना का विवरण', placeholder: 'Describe in detail what happened...', type: 'textarea', required: true },
      { key: 'witnesses', label: 'Witnesses / गवाह', placeholder: 'Witness names (optional)' },
    ],
  },
  rti: {
    title: 'RTI Application',
    icon: '📋',
    fields: [
      { key: 'applicant_name', label: 'Applicant Name / आवेदक का नाम', placeholder: 'Full name', required: true },
      { key: 'applicant_address', label: 'Address / पता', placeholder: 'Complete address', required: true },
      { key: 'department', label: 'Department / विभाग', placeholder: 'e.g. Municipal Corporation, PWD', required: true },
      { key: 'information_sought', label: 'Information Required / मांगी जाने वाली जानकारी', placeholder: 'Describe specifically what info you need...', type: 'textarea', required: true },
      { key: 'time_period', label: 'Time Period / समयावधि', placeholder: 'e.g. 2020-2024' },
      { key: 'reason', label: 'Reason (optional) / कारण', placeholder: 'Why do you need this info?' },
    ],
  },
  notice: {
    title: 'Legal Notice',
    icon: '📜',
    fields: [
      { key: 'sender_name', label: 'Sender Name / भेजने वाले का नाम', placeholder: 'Your full name', required: true },
      { key: 'sender_address', label: 'Sender Address / पता', placeholder: 'Your complete address', required: true },
      { key: 'recipient_name', label: 'Recipient Name / प्राप्तकर्ता का नाम', placeholder: 'Name of party', required: true },
      { key: 'recipient_address', label: 'Recipient Address / पता', placeholder: 'Their address', required: true },
      { key: 'notice_type', label: 'Notice Type', type: 'select', options: ['Defamation', 'Property Dispute', 'Non-payment of dues', 'Breach of contract', 'Eviction', 'Other'], required: true },
      { key: 'details', label: 'Details / विवरण', placeholder: 'Describe the issue and your demand...', type: 'textarea', required: true },
      { key: 'relief_sought', label: 'Relief Sought / मांग', placeholder: 'What action do you expect from them?', required: true },
      { key: 'compliance_days', label: 'Days to Comply', placeholder: '7', type: 'number' },
    ],
  },
  complaint: {
    title: 'Consumer Complaint',
    icon: '📝',
    fields: [
      { key: 'consumer_name', label: 'Consumer Name', placeholder: 'Your full name', required: true },
      { key: 'consumer_address', label: 'Address', placeholder: 'Complete address', required: true },
      { key: 'company_name', label: 'Company/Seller Name', placeholder: 'Who you bought from', required: true },
      { key: 'product_service', label: 'Product/Service', placeholder: 'What was purchased', required: true },
      { key: 'purchase_date', label: 'Purchase Date', type: 'date' },
      { key: 'amount', label: 'Amount Paid (₹)', placeholder: 'e.g. 5000', type: 'number' },
      { key: 'complaint_details', label: 'Complaint Details', placeholder: 'Describe the defect/deficiency...', type: 'textarea', required: true },
      { key: 'relief', label: 'Relief Sought', placeholder: 'Refund/replacement/compensation?', required: true },
    ],
  },
};

const generateDocument = (docType, formData) => {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  if (docType === 'fir') {
    return `
TO,
The Station House Officer
___________________________ Police Station
___________________________ District

Subject: Application for Registration of FIR

Respected Sir/Madam,

I, ${formData.complainant_name || '[Your Name]'}, resident of ${formData.complainant_address || '[Your Address]'}, Contact: ${formData.complainant_phone || '[Phone]'}, hereby lodge a complaint against the following:

DATE OF INCIDENT: ${formData.incident_date || '[Date]'}
PLACE OF INCIDENT: ${formData.incident_place || '[Place]'}
ACCUSED PERSON(S): ${formData.accused_name || 'Unknown / Not Known'}

DESCRIPTION OF INCIDENT:
${formData.incident_description || '[Describe incident here]'}

WITNESSES (if any):
${formData.witnesses || 'None mentioned'}

I solemnly affirm that the above information is true and correct to the best of my knowledge. I request you to register an FIR and take necessary legal action against the accused under the relevant provisions of IPC/CrPC.

I am attaching supporting evidence if any.

Yours faithfully,

${formData.complainant_name || '[Your Name]'}
Date: ${today}
Place: ${formData.incident_place?.split(',')[0] || '[City]'}
Signature: _______________

---
Note: Under Section 154 CrPC, the police are legally bound to register your FIR. If refused, you can approach the Superintendent of Police or file a complaint to the Magistrate under Section 156(3) CrPC.
    `.trim();
  }

  if (docType === 'rti') {
    return `
APPLICATION UNDER RIGHT TO INFORMATION ACT, 2005

To,
The Public Information Officer
${formData.department || '[Department Name]'}
___________________________ [Office Address]

Date: ${today}

Subject: Request for Information under Section 6(1) of the RTI Act, 2005

Sir/Madam,

I, ${formData.applicant_name || '[Your Name]'}, resident of ${formData.applicant_address || '[Your Address]'}, wish to obtain the following information under the Right to Information Act, 2005:

INFORMATION REQUIRED:
${formData.information_sought || '[Describe the information needed]'}

TIME PERIOD: ${formData.time_period || 'Latest available records'}

${formData.reason ? `PURPOSE: ${formData.reason}` : ''}

I am enclosing the application fee of Rs. 10/- [by IPO/DD/Court Fee Stamp] as required.

If the information cannot be provided, please inform the reason in writing within the stipulated time period of 30 days.

Thanking you,

Yours sincerely,
${formData.applicant_name || '[Your Name]'}
Address: ${formData.applicant_address || '[Address]'}
Date: ${today}

---
Note: Under Section 7(1) RTI Act, you must receive information within 30 days. For life/liberty related matters — 48 hours. First Appeal can be made within 30 days if unsatisfied.
    `.trim();
  }

  if (docType === 'notice') {
    return `
LEGAL NOTICE

FROM:
${formData.sender_name || '[Sender Name]'}
${formData.sender_address || '[Sender Address]'}

TO:
${formData.recipient_name || '[Recipient Name]'}
${formData.recipient_address || '[Recipient Address]'}

Date: ${today}

Subject: Legal Notice — ${formData.notice_type || 'Legal Matter'}

Dear ${formData.recipient_name || 'Sir/Madam'},

UNDER INSTRUCTIONS FROM MY CLIENT:
${formData.sender_name || '[Name]'} — hereinafter referred to as "my client" — I hereby serve you with this legal notice:

FACTS AND CIRCUMSTANCES:
${formData.details || '[Describe the issue in detail]'}

RELIEF SOUGHT:
${formData.relief_sought || '[State your demand clearly]'}

You are hereby called upon to comply with the above within ${formData.compliance_days || '7'} (${formData.compliance_days || 'Seven'}) days of receipt of this notice, failing which my client shall be constrained to take appropriate legal proceedings against you before the competent court of law, at your risk, cost and consequences.

This notice is without prejudice to my client's other rights and remedies.

Yours truly,
[Advocate Name]
Bar Council No.: ___________
For and on behalf of ${formData.sender_name || '[Client Name]'}

Date: ${today}
    `.trim();
  }

  return `Document type '${docType}' — Generated on ${today}\n\n${JSON.stringify(formData, null, 2)}`;
};

export default function DocumentModal({ docType, onClose, sessionId }) {
  const [formData, setFormData] = useState({});
  const [generated, setGenerated] = useState(false);
  const [docContent, setDocContent] = useState('');

  const form = DOC_FORMS[docType] || DOC_FORMS.fir;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    const content = generateDocument(docType, formData);
    setDocContent(content);
    setGenerated(true);
  };

  const handleDownload = () => {
    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.replace(/ /g, '_')}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(docContent);
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>
            <span style={{ fontSize: 24 }}>{form.icon}</span>
            <div>
              <div style={styles.titleText}>{form.title}</div>
              <div style={styles.titleSub}>AI-Assisted Document Generator</div>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.modalBody}>
          {!generated ? (
            <div style={styles.formArea}>
              <p style={styles.formNote}>
                ℹ️ Fill in the details below. All fields marked * are required.
              </p>
              {form.fields.map((field) => (
                <div key={field.key} style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>
                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      style={{ ...styles.input, ...styles.textarea }}
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      style={styles.input}
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      style={styles.input}
                    />
                  )}
                </div>
              ))}
              <button onClick={handleGenerate} style={styles.generateBtn}>
                ✨ Generate Document
              </button>
            </div>
          ) : (
            <div style={styles.resultArea}>
              <div style={styles.resultHeader}>
                <span style={styles.resultTitle}>✅ Document Generated Successfully</span>
                <div style={styles.resultActions}>
                  <button onClick={handleCopy} style={styles.actionBtn}>📋 Copy</button>
                  <button onClick={handleDownload} style={styles.downloadBtn}>⬇️ Download .txt</button>
                  <button onClick={() => setGenerated(false)} style={styles.editBtn}>✏️ Edit</button>
                </div>
              </div>
              <pre style={styles.docPreview}>{docContent}</pre>
              <div style={styles.disclaimer}>
                ⚠️ This document is AI-generated for informational purposes. Please review with a qualified lawyer before submission. NyayMitra is not liable for any legal outcomes.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.2s ease' },
  modal: { background: '#0f172a', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(20,184,166,0.12)' },
  modalTitle: { display: 'flex', alignItems: 'center', gap: 14 },
  titleText: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#f0fdfa', fontWeight: 700 },
  titleSub: { fontSize: 12, color: '#4b5563', fontFamily: 'Mukta' },
  closeBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 },
  modalBody: { flex: 1, overflow: 'auto' },
  formArea: { padding: 24 },
  formNote: { color: '#6b7280', fontSize: 13, fontFamily: 'Mukta', marginBottom: 20, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 8, padding: '10px 14px' },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { display: 'block', fontSize: 13, color: '#9ca3af', fontFamily: 'Mukta', fontWeight: 500, marginBottom: 6 },
  input: { width: '100%', background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(55,65,81,0.5)', borderRadius: 8, padding: '10px 12px', color: '#e5e7eb', fontFamily: 'Mukta', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  textarea: { resize: 'vertical', minHeight: 80 },
  generateBtn: { width: '100%', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', border: 'none', borderRadius: 10, padding: '14px', color: '#fff', fontFamily: 'Mukta', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  resultArea: { padding: 24 },
  resultHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 },
  resultTitle: { color: '#5eead4', fontFamily: 'Mukta', fontWeight: 600, fontSize: 15 },
  resultActions: { display: 'flex', gap: 8 },
  actionBtn: { background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', color: '#5eead4', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'Mukta' },
  downloadBtn: { background: 'rgba(15,118,110,0.3)', border: '1px solid rgba(20,184,166,0.4)', color: '#2dd4bf', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'Mukta', fontWeight: 600 },
  editBtn: { background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', color: '#fbbf24', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'Mukta' },
  docPreview: { background: 'rgba(3,7,18,0.6)', border: '1px solid rgba(55,65,81,0.3)', borderRadius: 10, padding: 18, color: '#d1d5db', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflow: 'auto' },
  disclaimer: { marginTop: 16, color: '#4b5563', fontSize: 11, fontFamily: 'Mukta', lineHeight: 1.5, background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: 8, padding: '10px 12px' },
};
