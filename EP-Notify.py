import json
import boto3
from botocore.vendored import requests

def lambda_handler(event, context):
    # TODO implement
    sqs = boto3.resource('sqs')
    queue = sqs.get_queue_by_name(QueueName='easy-planner')
    sns = boto3.resource('sns')
    client = boto3.client('sns')
    topic = sns.Topic('EP-Notify')
    sub_detail = client.list_subscriptions()
    message = queue.receive_messages(MessageAttributeNames=[
        'Emails', 'Messages'
        ])
    '''msg = 'test'
    emails = ['bn2300@columbia.edu']
    for email in emails:
        topic_arn = [item['TopicArn'] for item in sub_detail['Subscriptions'] if item['Endpoint'] == email][0]
        topic.publish(TopicArn=topic_arn, Message="abfdf")'''
    while len(message):
        info = message[0].message_attributes
        raw_email, msg = info['Emails']['StringValue'], info['Messages']['StringValue']
        emails = raw_email.strip().split(',')
        
        """ --- Send SNS --- """
        for email in emails:
            for item in sub_detail['Subscriptions']:
                if item['Endpoint'] == email:
                    topic_arn = item['TopicArn']
            # topic_arn = [item['TopicArn'] for item in sub_detail['Subscriptions'] if item['Endpoint'] == email][0]
            topic.publish(TopicArn=topic_arn, Message=msg)
        message[0].delete()
        message = queue.receive_messages(MessageAttributeNames=[
        'Emails', 'Messages'
        ])
        if len(message): break
    return {
        'statusCode': 200
    }
