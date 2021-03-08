#  Backend code
Backend code created in python within AWS lambda function.

## Description

Function called from an API Gateway (translate-API), receive two parameters to get a translation.

## List of parameters

```
event: array to receive parameters from API

This function is called from an API Gateway (translate-API), receive three parameters inside an array to get a translation.
    event: array to receive parameters from API
    event['queryStringParameters']['TargetLang']: Target language for translate
    event['queryStringParameters']['Bucketkey']: s3 key object with transcription
```

# Functionalities

## Coding notes:

1) If the source language is the same target language, a JSON is also stored
    using the original transcription text.
2) AWS translate_text() allows 5000 bytes per request, so original
    transcription must be split in case its size is bigger.
    https://docs.aws.amazon.com/translate/latest/dg/what-is-limits.html
3) Best practices for working with AWS Lambda functions
        https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
4) Lambda, API Gateway and Bucket must be in the same server.
5) Functionalities:
    * Detects if transcription (key) exists in Bucket. If not, returns 400
    * Returns translations already stored to improve efficiency
    * If no translation found, automatically detects transcription language.
    If language can't be detected, returns 400
    * If the target language is the same transcription language, converts
    transcription to JSON, store it and return it
    * If the target language is different than transcription language, it
    translates it, converts transcription to JSON, store it, return it.
    Stored file name: key_targetLanguage.srt (e.g: video1_es.srt)
    * Translates transcriptions bigger than 5000 bytes (maximum allowed by
    request), doing split without cutting sentences. Step for split can be
    4990 for Unicode-8 general languages, but for very special characters
    languages, step must be as low as 600.
    * Returns 500 in case any error occurs during the translate/store task.

https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Client.head_object

https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Client.get_object

https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/translate.html

https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/translate.html#Translate.Client.start_text_translation_job

https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/comprehend.html


## Return

```
'''Resonse dictionary '''
resp = {    'statusCode': 200,
            'headers': {'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'targetKey': targetkey
                        },
                        'body': json.dumps([])
        }
```


## Built With

* AWS console


## Authors

* **Carlos Andres Garcia Morales** - [Github](https://github.com/agzsoftsi) - [Twitter](https://twitter.com/karlgarmor)
* **Ivan Dario Lasso Gil** - [Github](https://github.com/ilasso) - [Twitter](https://twitter.com/ilasso)
* **Leonardo Calderon Jaramillo** - [Github](https://github.com/leocjj) - [Twitter](https://twitter.com/leocj)

