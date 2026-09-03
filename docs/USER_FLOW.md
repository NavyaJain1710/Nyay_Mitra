# NyayMitra — Example User Flows

## Flow 1: FIR Filing (Most Common)

```
User visits nyaymitra.in
      ↓
Clicks "Start Free Consultation"
      ↓
Chat opens with NyayMitra greeting
      ↓
User types: "FIR file karni hai police mujhe rok rahi hai"
      ↓
AI responds with:
  - Step-by-step FIR guide
  - Legal rights under CrPC 154
  - IPC 166A (police cannot refuse)
  - Zero FIR option
      ↓
User clicks "Generate Document" → FIR Application Modal opens
      ↓
User fills: name, address, incident details
      ↓
AI generates complete FIR application
      ↓
User downloads .txt file → takes to police station
      ↓
[Optional] Case escalated to human lawyer if flagged as urgent
```

---

## Flow 2: Cyber Fraud (High Urgency)

```
User: "Online fraud hua 2 lakh gaye account se abhi"
      ↓
Urgency Classifier → HIGH 🔴
      ↓
AI responds:
  - "URGENT: Turant yeh karein"
  - Bank helpline number
  - cybercrime.gov.in link
  - Helpline 1930
  - IPC 66D, IPC 420 sections
      ↓
Admin Dashboard → 🔴 HIGH badge appears for this session
      ↓
Admin lawyer sees and sends personalized guidance
      ↓
User gets both AI + human expert help
```

---

## Flow 3: Document Generation (RTI)

```
User visits /documents
      ↓
Selects "RTI Application"
      ↓
Form opens: Department, information needed, time period
      ↓
User fills form in 2 minutes
      ↓
AI generates legally formatted RTI application
      ↓
User downloads and submits to PIO
      ↓
Includes instructions: "30 days response time, first appeal rights"
```

---

## Flow 4: Admin Handling Urgent Case

```
Admin opens admin-dashboard/index.html
      ↓
Sees user list with urgency badges:
  🔴 Meera Devi — Domestic Violence — 2 min ago
  🔴 Priya Sharma — Cyber Fraud — 15 min ago
  🟡 Suresh Patel — Labour Issue — 1 hr ago
      ↓
Admin clicks Meera Devi's case
      ↓
Sees full conversation history on right panel
      ↓
AI Panel shows:
  - Suggested reply about PWDVA protection order
  - Relevant sections: IPC 498A, PWDVA 2005
  - Quick action: "Escalate to Senior Lawyer"
      ↓
Admin edits suggestion → clicks Send
      ↓
User sees reply in their chat window in real-time
      ↓
Admin marks case with tag "DV" and resolves
```

---

## Flow 5: Voice Input

```
User opens chat on mobile
      ↓
Taps 🎙️ microphone button
      ↓
Speaks: "मेरे ज़मीन पर कब्ज़ा हो गया है"
      ↓
Web Speech API transcribes to Hindi text
      ↓
Text appears in input box
      ↓
User taps Send
      ↓
AI responds with property dispute options
      ↓
IPC chips show: Transfer of Property Act, CPC Order 39
```
