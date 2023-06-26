import openai
from langchain.chat_models import ChatOpenAI
from langchain import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
from langchain.text_splitter import CharacterTextSplitter
from langchain.docstore.document import Document
import os
import boto3

s3_client = boto3.client('s3')

# Initialising the text splitter

def lambda_handler(event, context):
    s3_bucket = event['bucket']
    s3_key = event['key']

    response = s3_client.get_object(Bucket=s3_bucket, Key=s3_key)
    transcripts = response['Body'].read().decode('utf-8')
    api_key = os.environ.get("SECRET_KEY")

    # Initialising the ChatGPT Model
    chatgpt = ChatOpenAI(temperature=0.0, openai_api_key=api_key, model='gpt-3.5-turbo-16k')
    docs = []
    text_splitter = CharacterTextSplitter()
    # Split the transcripts into texts
    texts = text_splitter.split_text(transcripts)

    # Create Document objects for each text
    for t in texts:
        doc = Document(page_content=t)
        docs.append(doc)

    # Prompt for the model
    prompt_template = """
    For the following text delimited by curly bracket, extract the following information:

    Informative Summary: provide a concise summary of the conversation that captures the main points discussed.

    Decision-making Summary: Analyze the decision-making process in the conversation and identify key moments where important decisions were made or extensively discussed

    Action-Oriented Summary: Extract actionable items from the conversation, including any specific tasks, recommendations, or follow-up actions mentioned.

    Format the output in bulleted list.

    text: {text}
    """

    PROMPT = PromptTemplate(template=prompt_template, input_variables=["text"])
    chain = load_summarize_chain(chatgpt, chain_type="map_reduce", combine_prompt=PROMPT)
    output = chain.run(docs)

    return output
