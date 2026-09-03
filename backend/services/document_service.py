"""Legal Document Generator Service"""

from datetime import datetime
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def today_str():
    return datetime.now().strftime("%d %B %Y")


class DocumentGenerator:
    def generate(self, doc_type: str, form_data: Dict[str, Any], language: str = "hindi") -> Dict[str, str]:
        generators = {
            "fir": self._gen_fir,
            "rti": self._gen_rti,
            "notice": self._gen_notice,
            "complaint": self._gen_complaint,
            "bail": self._gen_bail,
            "affidavit": self._gen_affidavit,
        }
        gen_fn = generators.get(doc_type)
        if not gen_fn:
            raise ValueError(f"Unknown document type: {doc_type}")
        content = gen_fn(form_data)
        return {"title": self._get_title(doc_type), "content": content}

    def _get_title(self, doc_type: str) -> str:
        titles = {"fir": "FIR Application", "rti": "RTI Application", "notice": "Legal Notice", "complaint": "Consumer Complaint", "bail": "Bail Application", "affidavit": "Affidavit"}
        return titles.get(doc_type, "Legal Document")

    def _gen_fir(self, d: Dict) -> str:
        return f"""TO,
The Station House Officer
_________________________ Police Station
_________________________ District

Subject: Application for Registration of FIR

Respected Sir/Madam,

I, {d.get('complainant_name', '[Name]')}, resident of {d.get('complainant_address', '[Address]')},
Contact: {d.get('complainant_phone', '[Phone]')}, hereby lodge a complaint:

DATE OF INCIDENT: {d.get('incident_date', '[Date]')}
PLACE OF INCIDENT: {d.get('incident_place', '[Place]')}
ACCUSED PERSON(S): {d.get('accused_name', 'Unknown')}

INCIDENT DESCRIPTION:
{d.get('incident_description', '[Describe incident here]')}

WITNESSES: {d.get('witnesses', 'None')}

I request you to register an FIR and take legal action under relevant IPC/CrPC provisions.

                                        Yours faithfully,
                                        {d.get('complainant_name', '[Name]')}
                                        Date: {today_str()}
                                        Signature: _______________

---
Legal Note: Under CrPC Section 154, police are bound to register your FIR.
If refused, approach SP or file complaint under CrPC 156(3)."""

    def _gen_rti(self, d: Dict) -> str:
        return f"""APPLICATION UNDER RIGHT TO INFORMATION ACT, 2005
Section 6(1)

To,
The Public Information Officer
{d.get('department', '[Department Name]')}

Date: {today_str()}

Subject: Request for Information under RTI Act, 2005

Sir/Madam,

I, {d.get('applicant_name', '[Name]')}, resident of {d.get('applicant_address', '[Address]')},
request the following information:

INFORMATION REQUIRED:
{d.get('information_sought', '[Describe information needed]')}

TIME PERIOD: {d.get('time_period', 'Latest records')}
{f"PURPOSE: {d.get('reason')}" if d.get('reason') else ''}

Application fee of Rs. 10/- enclosed as required.

                                        Yours sincerely,
                                        {d.get('applicant_name', '[Name]')}
                                        Date: {today_str()}

---
Note: Response mandatory within 30 days (RTI Act Sec 7(1)).
First appeal: 30 days after receipt. Second appeal: Information Commission."""

    def _gen_notice(self, d: Dict) -> str:
        return f"""LEGAL NOTICE

FROM:
{d.get('sender_name', '[Sender Name]')}
{d.get('sender_address', '[Sender Address]')}

TO:
{d.get('recipient_name', '[Recipient Name]')}
{d.get('recipient_address', '[Recipient Address]')}

Date: {today_str()}

Subject: Legal Notice — {d.get('notice_type', 'Legal Matter')}

Dear {d.get('recipient_name', 'Sir/Madam')},

Under instructions from my client {d.get('sender_name', '[Name]')}, I hereby serve this notice:

FACTS:
{d.get('details', '[Describe issue in detail]')}

RELIEF SOUGHT:
{d.get('relief_sought', '[State your demand]')}

You are called upon to comply within {d.get('compliance_days', '7')} days of receipt.
Failing which, my client shall approach the competent court at your risk and cost.

                                        [Advocate Name]
                                        Bar Council No.: ___________
                                        For and on behalf of {d.get('sender_name', '[Client]')}
                                        Date: {today_str()}"""

    def _gen_complaint(self, d: Dict) -> str:
        return f"""CONSUMER COMPLAINT
Under Consumer Protection Act, 2019

To,
The President,
District Consumer Disputes Redressal Commission
[District Name]

Complainant: {d.get('consumer_name', '[Name]')}, {d.get('consumer_address', '[Address]')}
Opposite Party: {d.get('company_name', '[Company]')}

SUBJECT: Complaint for {d.get('complaint_details', 'Deficiency in service')[:50]}...

FACTS OF THE CASE:
Product/Service: {d.get('product_service', '[Product]')}
Purchase Date: {d.get('purchase_date', '[Date]')}
Amount Paid: Rs. {d.get('amount', '[Amount]')}

DETAILS:
{d.get('complaint_details', '[Describe complaint]')}

RELIEF SOUGHT:
{d.get('relief', '[State relief required]')}

                                        {d.get('consumer_name', '[Name]')}
                                        Date: {today_str()}"""

    def _gen_bail(self, d: Dict) -> str:
        return f"""IN THE COURT OF ADDITIONAL SESSIONS JUDGE
[Court Name, City]

IN THE MATTER OF:
{d.get('applicant_name', '[Accused Name]')}
                                        ...APPLICANT/ACCUSED

FIR No.: {d.get('fir_number', '[FIR No.]')}
Under Section: {d.get('sections', '[IPC Sections]')}

APPLICATION FOR REGULAR BAIL UNDER SECTION 437/439 CrPC

MOST RESPECTFULLY SHOWETH:

1. The applicant was arrested on {d.get('arrest_date', '[Date]')} in the above matter.
2. The applicant has deep roots in society and will not abscond.
3. The applicant is willing to abide by all bail conditions.

GROUNDS: {d.get('grounds', '[Grounds for bail]')}

It is therefore prayed that this Hon'ble Court may be pleased to grant bail
to the applicant on such terms as deemed fit.

                                        [Advocate Name]
                                        For the Applicant
                                        Date: {today_str()}"""

    def _gen_affidavit(self, d: Dict) -> str:
        return f"""AFFIDAVIT

I, {d.get('deponent_name', '[Name]')}, son/daughter/wife of {d.get('parent_name', '[Parent Name]')},
aged {d.get('age', '[Age]')} years, resident of {d.get('address', '[Address]')},
do hereby solemnly affirm and declare as under:

1. That I am the deponent in the above matter and competent to swear this affidavit.

{d.get('statements', '2. [Add your statements here, numbered]')}

I state that the contents of this affidavit are true and correct to the best
of my knowledge and belief. Nothing material has been concealed therein.

DEPONENT
{d.get('deponent_name', '[Name]')}

Verified at [City] on this {today_str()}

NOTARY/OATH COMMISSIONER
[Seal & Signature]"""
