# Amazon Bedrock Knowledge Base CDK 项目

这个项目使用AWS CDK创建基于OpenSearch Serverless的Amazon Bedrock Knowledge Bases，帮助您快速构建和部署RAG（检索增强生成）应用程序。

## 项目概述

本项目使用`generative-ai-cdk-constructs`库（版本0.1.302）创建了一个完整的Amazon Bedrock Knowledge Base解决方案，包括：

- 基于OpenSearch Serverless的向量存储
- Amazon Bedrock知识库配置
- S3数据源集成
- 自动文档分块处理

## 架构

![架构图](https://d1.awsstatic.com/generative-ai/knowledge-base-architecture.png)

主要组件：

1. **S3存储桶**：用于存储文档数据
2. **OpenSearch Serverless**：提供向量存储和搜索功能
3. **Amazon Bedrock**：提供嵌入模型（Titan Embeddings）
4. **IAM角色和策略**：确保安全访问

## 部署步骤

1. 确保您已安装AWS CDK并配置了AWS凭证：
   ```
   npm install -g aws-cdk
   ```

2. 安装项目依赖：
   ```
   npm install
   ```

3. 编译TypeScript代码：
   ```
   npm run build
   ```

4. 部署堆栈（默认部署到us-east-1区域，因为Amazon Bedrock在此区域可用）：
   ```
   npx cdk deploy
   ```

5. 部署完成后，您将在输出中看到：
   - 文档存储桶名称（用于上传文档）
   - Bedrock知识库ID

## 使用说明

1. **上传文档**：
   将您的文档（PDF、TXT、DOC等）上传到创建的S3存储桶中。
   ```
   aws s3 cp your-document.pdf s3://your-bucket-name/
   ```

2. **启动数据摄取**：
   ```
   aws bedrock start-ingestion-job --knowledge-base-id <您的知识库ID> --data-source-id <数据源ID>
   ```

3. **查询知识库**：
   您可以通过Amazon Bedrock API查询知识库，或将其与Bedrock Agent集成。

## 配置说明

当前配置使用了以下设置：

- **嵌入模型**：TITAN_EMBED_TEXT_V2_1024
- **分块策略**：固定大小，每块最大500个令牌，重叠率20%
- **向量类型**：浮点型（FLOAT32）

您可以在`lib/cfn_knowledge_base-stack.ts`文件中修改这些配置。

## 常用命令

* `npm run build`   编译TypeScript代码
* `npm run watch`   监视更改并自动编译
* `npm run test`    执行Jest单元测试
* `npx cdk deploy`  部署堆栈到您的AWS账户/区域
* `npx cdk diff`    比较已部署堆栈与当前状态
* `npx cdk synth`   生成CloudFormation模板

## 注意事项

- 确保您的AWS账户已启用Amazon Bedrock服务
- 此项目默认部署到us-east-1区域，如需更改，请修改`bin/cfn_knowledge_base.ts`文件
- 使用此知识库可能会产生AWS费用
