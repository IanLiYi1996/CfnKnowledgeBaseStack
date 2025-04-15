import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';

// 环境变量配置接口
interface EnvironmentConfig {
  kbName: string;
  kbDescription: string;
  kbInstruction: string;
  embeddingsModelType: string;
  maxTokens: number;
  overlapPercentage: number;
  dataSourceName: string;
}

export class CfnKnowledgeBaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 从环境变量获取配置，如果没有则使用默认值
    const config: EnvironmentConfig = {
      kbName: process.env.KB_NAME || 'OpenSearchServerlessKB',
      kbDescription: process.env.KB_DESCRIPTION || '基于OpenSearch Serverless的Amazon Bedrock知识库',
      kbInstruction: process.env.KB_INSTRUCTION || '使用此知识库回答关于文档的问题。它包含了重要的参考资料。',
      embeddingsModelType: process.env.EMBEDDINGS_MODEL_TYPE || 'TITAN_EMBED_TEXT_V2_1024',
      maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 500,
      overlapPercentage: process.env.OVERLAP_PERCENTAGE ? parseInt(process.env.OVERLAP_PERCENTAGE) : 20,
      dataSourceName: process.env.DATA_SOURCE_NAME || 'documents',
    };

    // 根据环境变量选择嵌入模型
    let embeddingsModel;
    switch (config.embeddingsModelType) {
      case 'TITAN_EMBED_TEXT_V2_1024':
        embeddingsModel = bedrock.BedrockFoundationModel.TITAN_EMBED_TEXT_V2_1024;
        break;
      case 'COHERE_EMBED_ENGLISH_V3':
        embeddingsModel = bedrock.BedrockFoundationModel.COHERE_EMBED_ENGLISH_V3;
        break;
      case 'COHERE_EMBED_MULTILINGUAL_V3':
        embeddingsModel = bedrock.BedrockFoundationModel.COHERE_EMBED_MULTILINGUAL_V3;
        break;
      default:
        embeddingsModel = bedrock.BedrockFoundationModel.TITAN_EMBED_TEXT_V2_1024;
    }

    // 创建一个S3存储桶用于存储文档
    const docBucket = new s3.Bucket(this, 'DocumentBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 创建基于OpenSearch Serverless的Knowledge Base
    const knowledgeBase = new bedrock.VectorKnowledgeBase(this, 'BedrockKnowledgeBase', {
      // 使用配置的嵌入模型
      embeddingsModel: embeddingsModel,
      // 知识库的说明
      instruction: config.kbInstruction,
      // 知识库名称
      name: config.kbName,
      // 知识库描述
      description: config.kbDescription,
    });

    // 添加S3数据源
    new bedrock.S3DataSource(this, 'S3DataSource', {
      bucket: docBucket,
      knowledgeBase: knowledgeBase,
      dataSourceName: config.dataSourceName,
      // 使用固定大小的分块策略
      chunkingStrategy: bedrock.ChunkingStrategy.fixedSize({
        maxTokens: config.maxTokens,
        overlapPercentage: config.overlapPercentage,
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
    
    // 输出配置信息
    new cdk.CfnOutput(this, 'ConfigInfo', {
      value: JSON.stringify({
        kbName: config.kbName,
        embeddingsModelType: config.embeddingsModelType,
        maxTokens: config.maxTokens,
        overlapPercentage: config.overlapPercentage,
      }, null, 2),
      description: '知识库配置信息',
    });
  }
}
