#!/usr/bin/env python
# coding: utf-8

# In[ ]:


#importing required libraries
get_ipython().system('pip3 install  langchain langchain_community chromadb  langchain-google-vertexai')
get_ipython().system('pip3 install "unstructured[all-docs]" pypdf pillow pydantic lxml pillow matplotlib chromadb tiktoken')
#checking dependencies


# In[ ]:


#initializing..
import os
import sys

from dotenv import load_dotenv
load_dotenv()

from config.auth import *
PROJECT_ID=os.getenv("PROJECT_ID")
REGION=os.getenv("REGION")

import vertexai 
vertexai.init(project=PROJECT_ID,location=REGION)


# In[ ]:


#basic example
import logging 
import zipfile
import requests

# importing required configs
logging.basicConfig(level=logging.INFO)
DATA_URL=os.getenv("DATA_URL")

#requesting..
response=requests.get(DATA_URL)
filename='resources/resources.zip'
with open(filename,"wb") as file:
    file.write(response.content)



#extracting current zip filter
with zipfile.ZipFile(filename,"r") as zip_ref:
    zip_ref.extractall()


# In[ ]:


from langchain_community.document_loaders import PyPDFLoader

loader=PyPDFLoader("resources/resources.zip")
docs=loader.load()
tables=[]
texts=[d.page_content for d in docs]


# In[ ]:


#checking contents
print("First:/t",texts[0])
print("Length:/t",len(texts))


# In[ ]:


##Generating text summaries
#importing required libraries
from langchain_google_vertexai import VertexAI , ChatVertexAI , VertexAIEmbeddings
# import vertexai 
from langchain.prompts import PromptTemplate
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda

#Generate summaries of text elements
def summaryFromInput(texts,tables,promptText='',summarizeTexts=False,modelName=None):
    prompt=PromptTemplate.from_template(promptText)

    empty=RunnableLambda(
        lambda x:AIMessage(content="Error processing document")
    )

    ##evulating chain
    #current model
    model=VertexAI(
        temprature=0,model_name=modelName,max_output_token=1024

    ).with_fallbacks([empty])

    summary={"element":lambda x:x}|prompt|model|StrOutputParser()


    #summaries
    textSummaries=[]
    tableSummaries=[]

    if texts and summary:
        #updating
        textSummaries=summary.batch(texts,{"max_concurrency":1})
    elif texts:
        textSummaries=texts

    if tables:
        tableSummaries=summary.batch(tables,{"max_concurrency":1})
    return textSummaries,tableSummaries


# In[ ]:


# #testing current function
# promptText=''
# textSummaries,tableSummaries=summaryFromInput(texts=texts,tables=tables,promptText=promptText,modelName='')


# In[ ]:


import uuid
from langchain.retrievers.multi_vector import MultiVectorRetriever
from langchain.storage import InMemoryStore
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document


# In[ ]:


from langchain_huggingface  import HuggingFaceEmbeddings
def create_multi_vector_retriever(
   vectorstore, text_summaries, texts, table_summaries, tables, image_summaries, images
):
   """
   Create retriever that indexes summaries, but returns raw images or texts
   """

   # Initialize the storage layer
   store = InMemoryStore()
   id_key = "doc_id"

   # Create the multi-vector retriever
   from langchain_ollama import ChatOllama
   model = ChatOllama(
    model="qwen3:4b",
    temperature=0,
    )

   # Helper function to add documents to the vectorstore and docstore
   def add_documents(retriever, doc_summaries, doc_contents):
       doc_ids = [str(uuid.uuid4()) for _ in doc_contents]
       summary_docs = [
           Document(page_content=s, metadata={id_key: doc_ids[i]})
           for i, s in enumerate(doc_summaries)
       ]
       retriever.vectorstore.add_documents(summary_docs)
       retriever.docstore.mset(list(zip(doc_ids, doc_contents)))

   # Add texts, tables, and images
   # Check that text_summaries is not empty before adding
   if text_summaries:
       add_documents(retriever, text_summaries, texts)
   # Check that table_summaries is not empty before adding
   if table_summaries:
       add_documents(retriever, table_summaries, tables)
   # Check that image_summaries is not empty before adding
   if image_summaries:
       add_documents(retriever, image_summaries, images)

   return retriever


# The vectorstore to use to index the summaries
vectorstore = Chroma(
   collection_name="mm_rag_cj_blog",
   embedding_function=HuggingFaceEmbeddings(
       model_name="BAAI/bge-m3",
       encode_kwargs={"normalize_embeddings":True},
   )

)

# Create retriever
retriever= create_multi_vector_retriever(
   vectorstore,
   text_summaries,
   texts,
   table_summaries,
   tables,
   image_summaries,
   img_base64_list,
)


# In[ ]:


question=''
output=retriever.invoke(question)

