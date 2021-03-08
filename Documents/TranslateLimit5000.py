############################################################################
# This code shows how to split large text documents along sentence 
# boundaries using NLTK and process each chunk with AWS Translate.
# https://idk.dev/translate-large-text-documents-with-amazon-translate/
############################################################################
# Be sure to first install nltk and boto3
import nltk.data
import boto3
# Define the source document that needs to be translated
source_document = "My little pony heart is yours..."
# Tell the NLTK data loader to look for resource files in /tmp/
nltk.data.path.append("/tmp/")
# Download NLTK tokenizers to /tmp/
# We use /tmp because that's where AWS Lambda provides write access to the local file system.
nltk.download('punkt', download_dir='/tmp/')
# Load the English language tokenizer
tokenizer = nltk.data.load('tokenizers/punkt/english.pickle')
# Split input text into a list of sentences
sentences = tokenizer.tokenize(source_document)
print("Input text length: " + str(len(source_document)))
print("Number of sentences: " + str(len(sentences)))
translated_text = ''
source_text_chunk = ''
translate_client = boto3.client('translate')
source_lang = "en"
target_lang = "fr"
for sentence in sentences:
  # Translate expects utf-8 encoded input to be no more than 
  # 5000 bytes, so we’ll split on the 5000th byte.
  if ((len(sentence.encode('utf-8')) + len(source_text_chunk.encode('utf-8')) < 5000)):
    source_text_chunk = source_text_chunk + ' ' + sentence
  else:
    print("Translation input text length: " + str(len(source_text_chunk)))
    translation_chunk = translate_client.translate_text(Text=source_text_chunk,SourceLanguageCode=source_lang,TargetLanguageCode=target_lang)
    print("Translation output text length: " + str(len(translation_chunk)))
    translated_text = translated_text + ' ' + translation_chunk["TranslatedText"]
    source_text_chunk = sentence
# Translate the final chunk of input text
print("Translation input text length: " + str(len(source_text_chunk)))
translation_chunk = translate_client.translate_text(Text=source_text_chunk,SourceLanguageCode=source_lang,TargetLanguageCode=target_lang)
print("Translation output text length: " + str(len(translation_chunk)))
translated_text = translated_text + ' ' + translation_chunk["TranslatedText"]
print("Final translation text length: " + str(len(translated_text)))
