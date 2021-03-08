# Api GateWay translatetext

API that takes a transcript file in srt format and translates it into a target language. The file is taken from an aws s3 bucket, which must have read permissions and its defined an a enviroment variable called [bucket] defined in al lambda function(translate-function) . A lambda function is executed that receives 2 query string parameters, [TargetLang] as the target language and [Bucketkey] as the file name.


## Consumes

invoke api gateway like this URL: [translatetext](ytuln8zsz1.execute-api.us-east-1.amazonaws.com/translatetext)

## Produced

application/json

## Resources

Path: /

The root resource with the default path specification.

## Method

Path: /
Method: GET

Gets a JSON format translated into a target language, for an SRT file of a source language transcript JSON format: 

	[ 
		{
			"index": "integer",
			"start": "hh: mm: ss, ms -> hh: mm: ss, ms",
			"content": "Text Translated"
		}
	]

JSON Example:

	[
	    {
	        "index": "1",
	        "start": "00:00:00",
	        "content": "Creo que como artistas,"
	    },
	    {
	        "index": "2",
	        "start": "00:00:01",
	        "content": "no tenemos que casillarnos y elegir ser una cosa u otra."
	    },
	    {
	        "index": "3",
	        "start": "00:00:11",
	        "content": "Hola, mi nombre es Roman Muradov."
	    }
	]

## Query String Parameters:

[BucketKey] name of s3 file

[TargetLang] Target language to translate Text


## Response Headers:

Path: /
Method: GET

status 200: succed:

	[statusCode] 200 OK
	[Access-Control-Allow-Origin] console.aws.amazon.com
	[Content-Type] application/json
	[body] object JSON format with the text translated into the target language
	[targetKey] translated s3 resource name

status 404: Bad QueryString Parameter:Video transcription file not found or Translation was not possible:

	[statusCode] 404 Not Found
	[Access-Control-Allow-Origin] console.aws.amazon.com
	[Content-Type] application/json
	[body] :Video transcription file not found or Translation was not possible
	[targetKey] translated s3 resource name

status 412: Video language not soported:

	[statusCode] 412 Precondition Failed
	[Access-Control-Allow-Origin] console.aws.amazon.com
	[Content-Type] application/json
	[body] : Video language not soported
	[targetKey] translated s3 resource name

status 500: An error occurred executing the aws Translate service:

	[statusCode] 500 Internal Server Error
	[Access-Control-Allow-Origin] console.aws.amazon.com
	[Content-Type] application/json
	[body] : An error occurred executing the aws Translate service
	[targetKey] translated s3 resource name

## Swagger

To run a test at the following link:

[test api gateway](https://app.swaggerhub.com/apis/ilasso/translate-api/1.3)

## Documentantion Files:

Files corresponding to export of the documentation made in the aws console like this:

contains json and yaml files for swagger and openAPI3

Export as openAPI3:

	To Postman:
	require "translate-API-translatetext-oas30-postman.json"
	translate-API-translatetext-oas30-postman.yaml

	To Swagger:
	translate-API-translatetext-oas30.json
	translate-API-translatetext-oas30.yaml

	To aws apigateway:
	translate-API-translatetext-oas30-apigateway.json
	translate-API-translatetext-oas30-apigateway.yaml

Export as swagger:

	To Postman:
	translate-API-translatetext-swagger-postman.json
	translate-API-translatetext-swagger-postman.yaml

	To Swagger:
	translate-API-translatetext-swagger.json
	translate-API-translatetext-swagger.yaml

	To aws apigateway:
	translate-API-translatetext-swagger-apigateway.json
	translate-API-translatetext-swagger-apigateway.yaml
