#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CfnKnowledgeBaseStack } from '../lib/cfn_knowledge_base-stack';

const app = new cdk.App();
new CfnKnowledgeBaseStack(app, 'CfnKnowledgeBaseStack', {
  /* 指定部署区域为us-east-1，因为Amazon Bedrock在此区域可用 */
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
});
