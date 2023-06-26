import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as dotenv from 'dotenv';


// Load environment variables from .env file
dotenv.config();

// Get the environment variable values with defaults
//const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
//const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const SECRET_KEY = process.env.SECRET_KEY || '';

export class PythonLambdaStack extends cdk.Stack {
  predictionLambda: lambda.DockerImageFunction;


  constructor(scope: Construct, constructId: string, props?: cdk.StackProps) {
    super(scope, constructId, props);

    this.buildLambdaFunc();
  }

  buildLambdaFunc() {
    const dockerfile = path.join(__dirname, '../ExampleDockerLambda');
    console.log(dockerfile,SECRET_KEY)

    this.predictionLambda = new lambda.DockerImageFunction(this, 'DockerLambda', {
      functionName: 'docker-lambda',
      code: lambda.DockerImageCode.fromImageAsset(dockerfile),
      memorySize: 512,
      timeout:cdk.Duration.seconds(900),
      environment:{

        //AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID,
       // AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY,
        SECRET_KEY: SECRET_KEY,
        
       },
      });
  }
}




