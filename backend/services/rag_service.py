import json
import logging
import os
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class RAGService:
    """
    Memory-efficient RAG Service optimized for cloud environments (Render Free Tier 512MB RAM).
    Uses TF-IDF vector similarity over the legal knowledge base with zero heavy PyTorch overhead.
    """
    def __init__(self, data_path: str = None):
        logger.info("Initializing RAGService (Lightweight TF-IDF mode)...")
        self.vectorizer = None
        self.tfidf_matrix = None
        self.documents = []
        
        # Determine data path (assuming we are in backend/services)
        if data_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            data_path = os.path.join(base_dir, "datasets", "legal_queries.json")
            
        self.load_data(data_path)
        
    def load_data(self, data_path: str):
        if not os.path.exists(data_path):
            logger.warning(f"Data file not found: {data_path}. RAG will have empty context.")
            return
            
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            self.documents = []
            texts = []
            
            for item in data:
                text = f"Query: {item.get('text', '')}\nCategory: {item.get('category', '')}\nRelevant Sections: {', '.join(item.get('ipc_sections', []))}"
                self.documents.append(text)
                texts.append(text)
                
            if texts:
                from sklearn.feature_extraction.text import TfidfVectorizer
                self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words=None)
                self.tfidf_matrix = self.vectorizer.fit_transform(texts)
                logger.info(f"Loaded {len(texts)} documents into TF-IDF RAG index.")
        except Exception as e:
            logger.error(f"Error loading RAG data: {e}")

    def get_context(self, query: str, top_k: int = 3) -> str:
        if self.vectorizer is None or self.tfidf_matrix is None or not self.documents:
            return ""
            
        try:
            from sklearn.metrics.pairwise import cosine_similarity
            query_vector = self.vectorizer.transform([query])
            similarities = cosine_similarity(query_vector, self.tfidf_matrix)[0]
            
            # Get top indices with positive similarity
            top_indices = similarities.argsort()[::-1][:top_k]
            results = [self.documents[idx] for idx in top_indices if similarities[idx] > 0.05]
            
            return "\n\n".join(results)
        except Exception as e:
            logger.error(f"Error searching RAG index: {e}")
            return ""
