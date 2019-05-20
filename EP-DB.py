import json
import boto3
import random
from botocore.vendored import requests

es_domin = 'https://search-easy-planner-usr-wand4exyx77d6e7ohl4gxmvs2i.us-east-1.es.amazonaws.com/users/'
dynamodb = boto3.resource('dynamodb')
headers = {'Content-Type' : 'application/json'}

def createRandomString(len):
    print ('wet'.center(10,'*'))
    raw = ""
    range1 = range(58, 65) # between 0~9 and A~Z
    range2 = range(91, 97) # between A~Z and a~z

    i = 0
    while i < len:
        seed = random.randint(48, 122)
        if ((seed in range1) or (seed in range2)):
            continue;
        raw += chr(seed);
        i += 1
    # print(raw)
    return raw
    
def dbsearch(query):
    table = dynamodb.Table('Easy-Planner-user')
    res = []
    responses = table.get_item(Key={
        'email': query
    })
    email_res = responses['Item']['friends']
    for email in email_res:
        url = es_domin + '_search?q=email:{}&size=1'.format(email)
        response = requests.request('GET', url).json()
        print(response)
        if response['hits']['total']:
            res.append((email, response['hits']['hits'][0]['_source']['name']))
        else:
            res.append((email, ""))
        # print(response)
    email_list = [{'name': name, 'email': email} for (email, name) in res]
    # print(email_list)
    return {
        'statusCode': 200,
        'body': email_list
    }

def eventput(data):
    env_table = dynamodb.Table('Easy-Planner-events')
    data_ID = createRandomString(10)
    # print(data['eventParticipants'])
    responses = env_table.put_item(Item={
        'eventID': data_ID,
        'eventName': data['eventName'],
        'eventDestination': data['eventDestination'],
        'eventDestinationId': data['eventDestinationId'],
        'eventStartDateTime': data['eventStartDateTime'],
        'eventEndDateTime': data['eventEndDateTime'],
        'eventHost': data['eventHost'],
        'eventParticipants': data['eventParticipants']
    })
    url = es_domin + '_search?q=email:{}&size=1'.format(data['eventHost'])
    response = requests.request('GET', url).json()
    if response['hits']['total']:
        host_name = response['hits']['hits'][0]['_source']['name']
    else:
        host_name = ""
    sqs = boto3.resource('sqs')
    queue = sqs.get_queue_by_name(QueueName='easy-planner')
    msg = {
        'Emails': {
            'StringValue': ",".join(data['eventParticipants']),
            'DataType': 'String'
        },
        'Messages': {
            'StringValue': "Dear user, {} invites you to attend the event at {} from {} to {}. Please visit our website for more details.".format(host_name, data['eventDestination'], data['eventStartDateTime'], data['eventEndDateTime']),
            'DataType': 'String'
        }
    }
    queue.send_message(MessageBody='message', MessageAttributes=msg)
    db_update([data['eventHost']], data_ID, 'events')
    db_update(data['eventParticipants'], data_ID, 'pending')
    # print(responses)
    return {
        'statusCode': 200
    }

def db_update(emails, eventID, key):
    usr_table = dynamodb.Table('Easy-Planner-user')
    # print(usr_table.global_secondary_indexes)
    for email in emails:
        old_res = usr_table.get_item(
        Key={
                'email': email
            }
        )
        try:
            if eventID not in old_res['Item'][key]:
                response = usr_table.update_item(
                    Key={
                            'email': email
                    },
                    AttributeUpdates={
                            key: {
                                    'Value': old_res['Item'][key] + [eventID],
                                    'Action': 'PUT'
                                }
                        }
                    )
        except:
            response = usr_table.update_item(
                    Key={
                            'email': email
                    },
                    AttributeUpdates={
                            key: {
                                    'Value': [eventID],
                                    'Action': 'PUT'
                                }
                        }
                    )

def userreg(data):
    email, name = data['email'], data['name']
    client = boto3.client('sns')
    table = dynamodb.Table('Easy-Planner-user')
    # print(email)
    topic_arn = client.create_topic(Name=email.replace('@','-').replace('.','-'))
    # print(topic_arn)
    response = client.subscribe(
        TopicArn=topic_arn['TopicArn'],
        Protocol='email',
        Endpoint=email
        )
    fields = {
        'name': name,
        'email': email,
        'events': [],
        'pending': []
        }
    response = requests.request('POST', es_domin + '_doc', headers=headers, data=json.dumps(fields))
    response = table.put_item(Item={'email': email})
    # print(response.json())
    return {
        'statusCode': 200
    }

def eventget(data):
    env_table = dynamodb.Table('Easy-Planner-events')
    usr_table = dynamodb.Table('Easy-Planner-user')
    res = []
    usr_responses = usr_table.get_item(Key={
        'email': data
    })
    # print(usr_responses)
    event_res = usr_responses['Item']['events']
    for event_ID in event_res:
        """
        url = es_domin + '_search?q=email:{}&size=1'.format(data['eventHost'])
        response = requests.request('GET', url).json()
        host_name = response['hits']['hits'][0]['_source']['name']
        for user in env_responses['Item']['eventParticipants']:
            url = es_domin + '_search?q=email:{}&size=1'.format(data['eventHost'])
            response = requests.request('GET', url).json()
        """
        env_responses = env_table.get_item(Key={
            'eventID': event_ID
        })
        res.append({
            'eventID': event_ID,
            'eventName': env_responses['Item']['eventName'],
            'eventDestination': env_responses['Item']['eventDestination'],
            'eventDestinationId': env_responses['Item']['eventDestinationId'],
            'eventStartDateTime': env_responses['Item']['eventStartDateTime'],
            'eventEndDateTime': env_responses['Item']['eventEndDateTime'],
            'eventHost': env_responses['Item']['eventHost'],
            'eventParticipants': env_responses['Item']['eventParticipants'],
            'isPending': False
        })
    pending_res = usr_responses['Item']['pending']
    for event_ID in pending_res:
        print(env_table.key_schema)
        env_responses = env_table.get_item(Key={
            'eventID': event_ID
        })
        res.append({
            'eventID': event_ID,
            'eventName': env_responses['Item']['eventName'],
            'eventDestination': env_responses['Item']['eventDestination'],
            'eventDestinationId': env_responses['Item']['eventDestinationId'],
            'eventStartDateTime': env_responses['Item']['eventStartDateTime'],
            'eventEndDateTime': env_responses['Item']['eventEndDateTime'],
            'eventHost': env_responses['Item']['eventHost'],
            'eventParticipants': env_responses['Item']['eventParticipants'],
            'isPending': True
        })
    return {
        'statusCode': 200,
        'body': res
    }

def pendingappr(data):
    usr_table = dynamodb.Table('Easy-Planner-user')
    [email, eventID] = data.split(',')
    res = usr_table.get_item(
        Key={
                'email': email
            }
        )
    old_event = res['Item']['events']
    old_pending = res['Item']['pending']
    old_pending.remove(eventID)
    response = usr_table.update_item(
        Key={
            'email': email
        },
        AttributeUpdates={
            'pending': {
                'Value': old_pending,
                'Action': 'PUT'
                },
            'events': {
                'Value': old_event + [eventID],
                'Action': 'PUT'
            }
        }
    )
    return {
        'statusCode': 200
    }
    

def lambda_handler(event, context):
    # return event
    if event['context']['resource-path'] == "/search":
        res = dbsearch(event['params']['querystring']['q'])
    elif event['context']['resource-path'] == "/event":
        if event['context']['http-method'] == 'PUT':
            res = eventput(event['body-json'])
        elif event['context']['http-method'] == 'GET':
            res = eventget(event['params']['querystring']['q'])
        elif event['context']['http-method'] == 'DELETE':
            res = pendingappr(event['params']['querystring']['q'])
    elif event['context']['resource-path'] == "/register":
        res = userreg(event['body-json'])
    # rst_info = ", ".join(["{}. {}, located at {}".format(i, item['Item']['Name'], item['Item']['Address']) for i, item in enumerate(responses, 1)])
    
    return res
