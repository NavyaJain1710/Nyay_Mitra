import json
import logging
import os
import faiss
import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self, data_path: str = None):
        logger.info("Initializing RAGService...")
        # Load a small, fast model for embeddings
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.documents = []
        
        # Determine data path (assuming we are in backend/services)
        if data_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            data_path = os.path.join(base_dir, "datasets", "legal_queries.json")
            
        self.load_data(data_path)
        
    def load_data(self, data_path: str):
        if not os.path.exists(data_path):
            logger.warning(f"Data file not found: {data_path}. RAG will have empty context.")
            self.index = faiss.IndexFlatL2(self.encoder.get_sentence_embedding_dimension())
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
                embeddings = self.encoder.encode(texts)
                self.index = faiss.IndexFlatL2(embeddings.shape[1])
                self.index.add(np.array(embeddings).astype("float32"))
                logger.info(f"Loaded {len(texts)} documents into RAG index.")
            else:
                self.index = faiss.IndexFlatL2(self.encoder.get_sentence_embedding_dimension())
                
        except Exception as e:
            logger.error(f"Error loading RAG data: {e}")
            self.index = faiss.IndexFlatL2(self.encoder.get_sentence_embedding_dimension())

    def get_context(self, query: str, top_k: int = 3) -> str:
        if self.index is None or not self.documents:
            return ""
            
        try:
            query_vector = self.encoder.encode([query])
            distances, indices = self.index.search(np.array(query_vector).astype("float32"), min(top_k, len(self.documents)))
            
            results = []
            for idx in indices[0]:
                if 0 <= idx < len(self.documents):
                    results.append(self.documents[idx])
                    
            return "\n\n".join(results)
        except Exception as e:
            logger.error(f"Error searching RAG index: {e}")
            return ""
