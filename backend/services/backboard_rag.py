# Document upload and RAG operations using Backboard
import time
from typing import List
from services.backboard_service import client

async def upload_document_to_assistant(assistant_id: str, file_path: str):
    """
    Upload a document to an assistant and wait for indexing.
    From quickstart documents.py
    
    Args:
        assistant_id: The assistant ID to upload the document to
        file_path: Path to the document file
    
    Returns:
        Document object with document_id
    """
    # Upload a document to the assistant
    document = await client.upload_document_to_assistant(
        assistant_id,
        file_path
    )
    
    # Wait for the document to be indexed
    print("Waiting for document to be indexed...")
    while True:
        status = await client.get_document_status(document.document_id)
        if status.status == "indexed":
            print("Document indexed successfully!")
            return document
        elif status.status == "failed":
            raise Exception(f"Document indexing failed: {status.status_message}")
        time.sleep(2)

async def upload_documents_batch(assistant_id: str, file_paths: List[str]):
    """
    Upload multiple documents to an assistant.
    
    Args:
        assistant_id: The assistant ID
        file_paths: List of file paths to upload
    
    Returns:
        List of document objects
    """
    documents = []
    for file_path in file_paths:
        doc = await upload_document_to_assistant(assistant_id, file_path)
        documents.append(doc)
    return documents
