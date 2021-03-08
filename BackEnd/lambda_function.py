from boto3 import client
from json import dumps
from os import environ

'''
Coding notes:
1) If the source language is the same target language, a JSON is also stored
    using the original transcription text.
2) AWS translate_text() allows 5000 bytes per request, so original
    transcription must be split in case its size is bigger.
    https://docs.aws.amazon.com/translate/latest/dg/what-is-limits.html
3) Best practices for working with AWS Lambda functions
    https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
4) Lambda, API Gateway and Bucket must be in the same server.
4) Functionalities:
    *) Detects if transcription (key) exists in Bucket. If not, returns 400
    *) Returns translations already stored to improve efficiency
    *) If no translation found, automatically detects transcription language.
        If language can't be detected, returns 400
    *) If the target language is the same transcription language, converts
        transcription to JSON, store it and return it
    *) If the target language is different than transcription language, it
        translates it, converts transcription to JSON, store it, return it.
        Stored file name: key_targetLanguage.srt (e.g: video1_es.srt)
    *) Translates transcriptions bigger than 5000 bytes (maximum allowed by
        request), doing split without cutting sentences. Step for split can be
        4990 for Unicode-8 general languages, but for very special characters
        languages, step must be as low as 600.
    *) Returns 500 in case any error occurs during the translate/store task.

https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Client.head_object
https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Client.get_object
https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/translate.html
https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/translate.html#Translate.Client.start_text_translation_job
https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/comprehend.html
'''

s3_client = client('s3')
comprehend_client = client('comprehend')
translate_client = client('translate')

# bucket declared as environmental variable.
bucket = environ.get('bucket')
# 5000, maximum of bytes for AWS translate_text, step=4990 for unicode-8 source
step = 4990
# Threshold to accept an identified language match [0...1]
lan_threshold = 0.6
# Response dictionary
resp = {'statusCode': 200,
        'headers': {'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'targetKey': ''},
        'body': dumps([])}
'''
languages_list = ["af","am","ar","as","az","ba","be","bn","bs","bg","ca","ceb",
                 "cs","cv","cy","da","de","el","en","eo","et","eu","fa","fi",
                 "fr","gd","ga","gl","gu","ht","he","hi","hr","hu","hy","ilo",
                 "id","is","it","jv","ja","kn","ka","kk","km","ky","ko","ku",
                 "la","lv","lt","lb","ml","mr","mk","mg","mn","ms","my","ne",
                 "new","nl","no","or","pa","pl","pt","ps","qu","ro","ru","sa",
                 "si","sk","sl","sd","so","es","sq","sr","su","sw","sv","ta",
                 "tt","te","tg","tl","th","tk","tr","ug","uk","ur","uz","vi",
                 "yi","yo","zh","zh-TW"]
'''


def lambda_handler(event, context):
    '''
    This function is called from an API Gateway (translate-API), receive three
    parameters inside an array to get a translation.
    event: array to receive parameters from API
    event['queryStringParameters']['TargetLang']: Target language for translate
    event['queryStringParameters']['Bucketkey']: s3 object with transcription
    '''
    key = event.get('queryStringParameters').get('Bucketkey')
    target_lang = event.get('queryStringParameters').get('TargetLang')
    return lambda_function(key, target_lang)


def lambda_function(key, target_lang):
    resp['headers']['targetKey'] = key[:key.rfind('.')] + '_' + target_lang + \
                                    '.srt'

    ''' IF ORIGINAL TRANSCRIPTION STORED IN S3 IS NOT FOUND, RETURN 40X '''
    if not key_exist(key):
        resp['body'] = dumps('Video transcription not found')
        return resp

    '''GET STORED TRANSLATION, IF NOT, TRANSLATE TRANSCRIPTION AND STORE IT'''
    if key_exist(resp.get('headers').get('targetKey')):
        translation_file = s3_client.get_object(
            Bucket=bucket,
            Key=resp.get('headers').get('targetKey'))
        resp['body'] = translation_file['Body'].read().decode("utf-8")
        resp['statusCode'] = 200  # Ok
        return resp
    else:
        # To get S3 object with original transcription
        response = s3_client.get_object(Bucket=bucket, Key=key)
        text = str(response.get('Body').read().decode('utf-8'))

        # Detect source language by sending first 100 characters to check
        response_language = comprehend_client.detect_dominant_language(
            Text=text[:100])
        if response_language.get('Languages')[0].get('Score') <= lan_threshold:
            resp['statusCode'] = 412    # Precondition Failed
            resp['body'] = dumps('Video language not soported')
            return resp
        source_lang = response_language.get('Languages')[0].get('LanguageCode')

        # Translate text if target language is not the source languaje
        if target_lang != source_lang:
            text = translate_batches(source_lang, target_lang, text)
        if not text:
            resp['body'] = dumps('Translation was not possible')
            return resp

        # Convert translated text into a list of dicts for every sentense
        list_translated = []
        for i in text.split('\n\n'):
            phrase = i.split('\n')
            list_translated.append({'index': phrase[0],
                                    'start': phrase[1][:8],
                                    'content': phrase[2]})

        # ######### ALWAYS ACTIVATE THIS IN PRODUCTION ##########
        # #### Store translation in a S3 object for future requests #####

        s3_client.put_object(Bucket=bucket,
                             Key=resp.get('headers').get('targetKey'),
                             Body=dumps(list_translated),
                             Metadata={'lang': target_lang,
                                       'src_trscpt_file': key})

        resp['statusCode'] = 200    # Ok
        resp['body'] = dumps(list_translated)
        return resp


def translate_batches(source_lang, target_lang, text):
    ''' Translate text in batches of step size without cutting rows of file'''
    lenn = len(text)
    if lenn <= step:
        try:
            translated_text = translate_client.translate_text(
                Text=text,
                SourceLanguageCode=source_lang,
                TargetLanguageCode=target_lang)
        except translate_client.exceptions.ClientError:
            # if e.response['Error']['Code'] == "500":
            resp['statusCode'] = 500   # Internal error
            return None
        return translated_text.get('TranslatedText')
    else:
        srt_temp = ''
        index_low = 0
        index_high = text.rfind('\n\n', 0, step)
        while(index_high < lenn and index_high != -1):
            try:
                translated_text = translate_client.translate_text(
                    Text=text[index_low:index_high],
                    SourceLanguageCode=source_lang,
                    TargetLanguageCode=target_lang)
            except translate_client.exceptions.ClientError:
                # if e.response['Error']['Code'] == "500":
                resp['statusCode'] = 500   # Internal error
                return None
            srt_temp += translated_text.get('TranslatedText') + '\n\n'
            index_low = index_high + 2
            index_high = text.rfind('\n\n', index_low, index_low + step)
        try:
            translated_text = translate_client.translate_text(
                Text=text[index_low:lenn],
                SourceLanguageCode=source_lang,
                TargetLanguageCode=target_lang)
        except translate_client.exceptions.ClientError:
            # if e.response['Error']['Code'] == "500":
            resp['statusCode'] = 500   # Internal error
            return None
        srt_temp += translated_text.get('TranslatedText')
        return srt_temp


def key_exist(s3_key):
    ''' TRY TO FIND IF S3 KEY EXIST '''
    try:
        s3_client.head_object(Bucket=bucket, Key=s3_key)
    except s3_client.exceptions.ClientError as e:
        if e.response.get('Error').get('Code') == "404":
            resp['statusCode'] = 404   # Not found
        return False
    else:
        return True
