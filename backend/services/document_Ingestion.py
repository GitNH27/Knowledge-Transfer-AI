# File for document ingestion (pdf, doc, txt) to clean text for later chunking and vectorizing

from langchain.document_loaders import PyPDFLoader, TextLoader, UnstructuredWordDocumentLoader
import pymupdf4llm
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List

from langchain_community.document_loaders import TextLoader, UnstructuredWordDocumentLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter, MarkdownTextSplitter
import pymupdf4llm
from typing import List

def ingest_documents(file_path: str, file_type: str, session_id: str):
    # 1. LOAD AND CONVERT TO MARKDOWN/DOCUMENTS
    if file_type == 'pdf':
        md_text = pymupdf4llm.to_markdown(file_path)
        # Markdown splitter is best for structured PDF output
        splitter = MarkdownTextSplitter(chunk_size=1000, chunk_overlap=150)
        docs = splitter.create_documents([md_text])
    
    elif file_type in ['docx', 'txt']:
        loader = UnstructuredWordDocumentLoader(file_path) if file_type == 'docx' else TextLoader(file_path)
        raw_docs = loader.load()
        # Recursive splitter is better for unstructured text/word docs
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        docs = splitter.split_documents(raw_docs)
    
    else:
        raise ValueError("Unsupported file type")

    # 2. UNIFY METADATA
    for doc in docs:
        doc.metadata.update({
            "session_id": session_id, 
            "source": file_path.split("/")[-1] # Clean filename
        })
        
    return docs