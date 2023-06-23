import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import path = require('path');
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';

export class PythonLambdaStack extends cdk.Stack {
  predictionLambda: lambda.DockerImageFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new ECR repository
    const ecrRepository = new ecr.Repository(this, 'ECRRepository', {
      repositoryName: 'my-docker-repo',
    });

    // Generate a unique identifier for the image asset using the stack's uniqueId
    //const imageAssetId = `${this.stackName}Asset`;

    // const asset = new ecrAssets.DockerImageAsset(this, imageAssetId, {
    //   directory: '.',
    //   repository: ecrRepository, // Set the ECR repository for the Docker image asset
    // });

    const dockerfile = path.join(__dirname, "..", "..", "Dockerfile");

    // An asset that represents a Docker image.
    // The image will be created in build time and uploaded to an ECR repository.
    const asset = new DockerImageAsset(this, `python-lambda`, {
      directory: dockerfile,
    });

    this.predictionLambda = new lambda.DockerImageFunction(this, 'DockerLambda', {
      code: lambda.DockerImageCode.fromEcr(asset.repository, {
        tag: 'latest',
      }),
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
    });

    // Define any additional resources or configurations for your Lambda function
    // ...

    // Output the Lambda function's ARN
    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: this.predictionLambda.functionArn,
    });
  }
}
