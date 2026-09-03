"""
NyayMitra ML Pipeline
Train and evaluate deep learning models for:
1. Urgency Classification (BERT-based)
2. Case Outcome Prediction
3. Document Classification
4. Named Entity Recognition
"""

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import numpy as np
import json
import logging
from typing import List, Dict, Tuple, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# 1. URGENCY CLASSIFIER (Fine-tuned BERT)
# ─────────────────────────────────────────────────────────────

class LegalUrgencyDataset(Dataset):
    """Dataset for urgency classification training."""
    
    TRAINING_DATA = [
        # HIGH urgency
        ("maar rahe hain mujhe", 2),
        ("life threat hai", 2),
        ("kidnapped meri beti ko", 2),
        ("domestic violence abhi ho raha hai", 2),
        ("rape happened today", 2),
        ("arrested mere bhai ko", 2),
        ("online fraud abhi hua 50000 gaye", 2),
        ("bank account khali ho gaya", 2),
        ("bail chahiye kal hearing hai", 2),
        ("court hearing tomorrow", 2),
        # MEDIUM urgency  
        ("fir file karni hai", 1),
        ("police complaint karna hai", 1),
        ("property dispute hai", 1),
        ("zameen ka vivad hai", 1),
        ("job se nikala gaya wrongfully", 1),
        ("consumer complaint deni hai", 1),
        ("cyber crime ka shikaar hua", 1),
        ("cheque bounce hua hai", 1),
        ("RTI ka jawab nahi aaya", 1),
        # LOW urgency
        ("RTI application kaise likhein", 0),
        ("what are my tenant rights", 0),
        ("how to register property", 0),
        ("legal notice ka format chahiye", 0),
        ("consumer rights kya hain", 0),
        ("fir ka format batao", 0),
        ("gratuity kaise calculate hoti hai", 0),
    ]
    
    def __init__(self, tokenizer=None, max_length: int = 128):
        self.data = self.TRAINING_DATA
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        text, label = self.data[idx]
        if self.tokenizer:
            encoding = self.tokenizer(
                text, max_length=self.max_length,
                padding='max_length', truncation=True,
                return_tensors='pt'
            )
            return {
                'input_ids': encoding['input_ids'].squeeze(),
                'attention_mask': encoding['attention_mask'].squeeze(),
                'label': torch.tensor(label, dtype=torch.long)
            }
        return {'text': text, 'label': label}


class UrgencyClassifierModel(nn.Module):
    """BERT-based urgency classifier."""
    
    def __init__(self, num_classes: int = 3, hidden_size: int = 768):
        super().__init__()
        # In production: load 'ai4bharat/indic-bert' or 'bert-base-multilingual-cased'
        self.dropout = nn.Dropout(0.3)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, bert_output):
        pooled = bert_output[:, 0, :]  # CLS token
        x = self.dropout(pooled)
        return self.classifier(x)


def train_urgency_classifier(
    model_save_path: str = "models/urgency_classifier.pt",
    epochs: int = 5,
    batch_size: int = 8,
    learning_rate: float = 2e-5,
):
    """Train the urgency classifier model."""
    try:
        from transformers import AutoTokenizer, AutoModel
        
        logger.info("Loading tokenizer for urgency classifier...")
        tokenizer = AutoTokenizer.from_pretrained("bert-base-multilingual-cased")
        bert_model = AutoModel.from_pretrained("bert-base-multilingual-cased")
        
        dataset = LegalUrgencyDataset(tokenizer=tokenizer)
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        classifier_head = UrgencyClassifierModel(num_classes=3)
        optimizer = torch.optim.AdamW(
            list(bert_model.parameters()) + list(classifier_head.parameters()),
            lr=learning_rate
        )
        criterion = nn.CrossEntropyLoss()
        
        bert_model.train()
        classifier_head.train()
        
        for epoch in range(epochs):
            total_loss = 0
            for batch in dataloader:
                optimizer.zero_grad()
                outputs = bert_model(
                    input_ids=batch['input_ids'],
                    attention_mask=batch['attention_mask']
                )
                logits = classifier_head(outputs.last_hidden_state)
                loss = criterion(logits, batch['label'])
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            
            logger.info(f"Epoch {epoch+1}/{epochs} | Loss: {total_loss/len(dataloader):.4f}")
        
        Path(model_save_path).parent.mkdir(parents=True, exist_ok=True)
        torch.save({
            'bert_state_dict': bert_model.state_dict(),
            'classifier_state_dict': classifier_head.state_dict(),
        }, model_save_path)
        logger.info(f"Model saved to {model_save_path}")
        
    except ImportError:
        logger.warning("transformers not installed — skipping BERT training")


# ─────────────────────────────────────────────────────────────
# 2. CASE OUTCOME PREDICTION
# ─────────────────────────────────────────────────────────────

class CaseOutcomePredictor(nn.Module):
    """Predicts win/lose probability based on case features."""
    
    def __init__(self, input_size: int = 50, hidden_size: int = 128):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 2),
            nn.Softmax(dim=1)
        )
    
    def forward(self, x):
        return self.network(x)
    
    def predict(self, case_features: Dict) -> Dict:
        """Predict outcome from case features (mock implementation)."""
        # In production: extract features from case description using NLP
        feature_vector = self._extract_features(case_features)
        with torch.no_grad():
            probs = self.forward(feature_vector.unsqueeze(0))
        win_prob = probs[0][1].item()
        return {
            "win_probability": round(win_prob * 100, 1),
            "lose_probability": round((1 - win_prob) * 100, 1),
            "confidence": "medium",
            "key_factors": self._explain_prediction(case_features),
        }
    
    def _extract_features(self, case: Dict) -> torch.Tensor:
        # Simple feature extraction (enhance with NLP in production)
        features = torch.zeros(50)
        text = str(case).lower()
        
        # Positive indicators
        if "evidence" in text: features[0] = 1.0
        if "witness" in text: features[1] = 1.0
        if "document" in text: features[2] = 1.0
        if "strong" in text: features[3] = 0.8
        
        # Negative indicators
        if "no evidence" in text: features[10] = -0.5
        if "delay" in text: features[11] = -0.3
        
        return features
    
    def _explain_prediction(self, case: Dict) -> List[str]:
        factors = []
        text = str(case).lower()
        if "evidence" in text:
            factors.append("Strong documentary evidence improves chances")
        if "witness" in text:
            factors.append("Witnesses strengthen the case")
        if "delay" in text:
            factors.append("Filing delay may weaken the case")
        factors.append("Outcome depends on judge and jurisdiction")
        return factors[:3]


# ─────────────────────────────────────────────────────────────
# 3. DOCUMENT CLASSIFIER
# ─────────────────────────────────────────────────────────────

class DocumentClassifier:
    """Classifies uploaded documents by type."""
    
    DOC_PATTERNS = {
        "FIR": ["first information", "station house officer", "complainant", "incident description"],
        "RTI Application": ["right to information", "public information officer", "information sought", "rti"],
        "Legal Notice": ["legal notice", "hereby served", "relief sought", "compliance"],
        "Consumer Complaint": ["consumer", "deficiency", "defect", "district forum", "opposite party"],
        "Bail Application": ["bail", "sessions judge", "accused", "crpc 437", "crpc 439"],
        "Affidavit": ["affidavit", "solemnly affirm", "deponent", "notary"],
        "Court Summons": ["summons", "appear before", "court", "date of hearing"],
        "Property Documents": ["sale deed", "conveyance", "transfer", "buyer", "seller"],
    }
    
    def classify(self, text: str) -> Dict:
        text_lower = text.lower()
        scores = {}
        for doc_type, patterns in self.DOC_PATTERNS.items():
            score = sum(1 for p in patterns if p in text_lower)
            if score > 0:
                scores[doc_type] = score
        
        if not scores:
            return {"doc_type": "Unknown", "confidence": 0.0}
        
        best = max(scores, key=scores.get)
        confidence = min(scores[best] / len(self.DOC_PATTERNS[best]) + 0.4, 0.98)
        return {"doc_type": best, "confidence": round(confidence, 2), "all_scores": scores}


# ─────────────────────────────────────────────────────────────
# 4. RAG PIPELINE (FAISS)
# ─────────────────────────────────────────────────────────────

class LegalRAGPipeline:
    """
    Retrieval-Augmented Generation for Indian Legal Corpus.
    Uses FAISS for vector similarity search.
    """
    
    def __init__(self, index_path: str = "models/legal_faiss.index"):
        self.index_path = index_path
        self.index = None
        self.corpus = []
        self.embedder = None
        self._load_or_build_index()
    
    def _load_or_build_index(self):
        """Load existing FAISS index or build a new one."""
        try:
            import faiss
            from sentence_transformers import SentenceTransformer
            
            self.embedder = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            
            if Path(self.index_path).exists():
                self.index = faiss.read_index(self.index_path)
                logger.info("FAISS index loaded")
            else:
                logger.info("Building FAISS index from corpus...")
                self._build_index()
        except ImportError:
            logger.warning("FAISS/sentence-transformers not installed — RAG disabled")
    
    def _build_index(self):
        """Build FAISS index from legal corpus."""
        import faiss
        
        legal_corpus = [
            "FIR can be filed under CrPC Section 154. Police cannot refuse to file FIR.",
            "Domestic violence cases are handled under Protection of Women from Domestic Violence Act 2005.",
            "RTI applications must be responded to within 30 days under RTI Act 2005.",
            "Consumer complaints can be filed at District Consumer Forum for amounts up to 50 lakhs.",
            "Wrongful termination cases are covered under Industrial Disputes Act Section 25F.",
            "Cyber crimes are handled under IT Act Section 66 and 66D with IPC 420.",
            "Property disputes can be resolved through Civil Court or Lok Adalat.",
            "Free legal aid is available through District Legal Services Authority (DLSA).",
        ]
        self.corpus = legal_corpus
        embeddings = self.embedder.encode(legal_corpus)
        
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings.astype(np.float32))
        
        Path(self.index_path).parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, self.index_path)
        logger.info(f"FAISS index built and saved: {self.index_path}")
    
    def retrieve(self, query: str, top_k: int = 3) -> List[str]:
        """Retrieve top-k relevant legal passages for a query."""
        if self.index is None or self.embedder is None:
            return []
        
        import faiss
        query_embedding = self.embedder.encode([query])
        faiss.normalize_L2(query_embedding)
        distances, indices = self.index.search(query_embedding.astype(np.float32), top_k)
        
        results = []
        for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
            if idx < len(self.corpus) and dist > 0.3:
                results.append(self.corpus[idx])
        return results


# ─────────────────────────────────────────────────────────────
# EVALUATION METRICS
# ─────────────────────────────────────────────────────────────

def evaluate_classifier(model, test_data: List[Tuple]) -> Dict:
    """Evaluate classifier with accuracy, precision, recall, F1."""
    from sklearn.metrics import accuracy_score, precision_recall_fscore_support
    
    y_true, y_pred = [], []
    for text, label in test_data:
        pred = model.classify(text)
        y_true.append(label)
        y_pred.append(pred)
    
    acc = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted')
    
    return {
        "accuracy": round(acc, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
    }


def evaluate_rag(rag_pipeline, test_queries: List[Dict]) -> Dict:
    """Evaluate RAG retrieval quality with Precision@K."""
    precision_scores = []
    for query_data in test_queries:
        retrieved = rag_pipeline.retrieve(query_data["query"], top_k=3)
        relevant = query_data.get("relevant_docs", [])
        hits = sum(1 for doc in retrieved if any(r in doc for r in relevant))
        precision_scores.append(hits / len(retrieved) if retrieved else 0)
    
    return {"precision_at_3": round(np.mean(precision_scores), 4)}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Training urgency classifier...")
    # train_urgency_classifier()  # Uncomment to train
    
    logger.info("\nTesting Document Classifier:")
    classifier = DocumentClassifier()
    test_docs = [
        "First Information Report filed against accused for theft",
        "Application under Right to Information Act for government records",
        "Legal Notice for non-payment of outstanding dues",
    ]
    for doc in test_docs:
        result = classifier.classify(doc)
        print(f"  '{doc[:50]}...' → {result['doc_type']} ({result['confidence']:.0%})")
    
    logger.info("\nTesting Case Outcome Predictor:")
    predictor = CaseOutcomePredictor()
    test_case = {"description": "Strong documentary evidence, multiple witnesses", "case_type": "property"}
    result = predictor.predict(test_case)
    print(f"  Win probability: {result['win_probability']}%")
    print(f"  Key factors: {result['key_factors'][0]}")
