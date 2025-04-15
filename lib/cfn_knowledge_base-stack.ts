import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';

export class CfnKnowledgeBaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 创建一个S3存储桶用于存储文档
    const docBucket = new s3.Bucket(this, 'DocumentBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 创建基于OpenSearch Serverless的Knowledge Base
    const knowledgeBase = new bedrock.VectorKnowledgeBase(this, 'BedrockKnowledgeBase', {
      // 使用Titan嵌入模型
      embeddingsModel: bedrock.BedrockFoundationModel.TITAN_EMBED_TEXT_V2_1024,
      // 知识库的说明
      instruction: '使用此知识库回答关于文档的问题。它包含了重要的参考资料。',
      // 知识库名称
      name: 'OpenSearchServerlessKB',
      // 知识库描述
      description: '基于OpenSearch Serverless的Amazon Bedrock知识库',
    });

    // 添加S3数据源
    new bedrock.S3DataSource(this, 'S3DataSource', {
      bucket: docBucket,
      knowledgeBase: knowledgeBase,
      dataSourceName: 'documents',
      // 使用固定大小的分块策略
      chunkingStrategy: bedrock.ChunkingStrategy.fixedSize({
        maxTokens: 500,
        overlapPercentage: 20,
      }),
    });

    // 输出S3桶名称和知识库ID
    new cdk.CfnOutput(this, 'DocumentBucketName', {
      value: docBucket.bucketName,
      description: '文档存储桶名称',
    });

    new cdk.CfnOutput(this, 'KnowledgeBaseId', {
      value: knowledgeBase.knowledgeBaseId,
      description: 'Bedrock知识库ID',
    });
  }
}
