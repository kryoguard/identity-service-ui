import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import { processNGData, validateNGPassportData } from "../validation/ng/nigerian-passport";
import countries from "../countries.json";
import { BaseData, Data } from "../validation/data-interface";
import { DetectFacesCommand, RekognitionClient } from "@aws-sdk/client-rekognition";

const awsConfig = {
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    identityPoolId: process.env.AWS_USER_POOL_ID || 'us-east-1:8cb00b35-556e-445c-aa3d-0e8d7f3276de'
};

interface TextractConfig {
    region: string;
    identityPoolId: string;
}

interface TextractResponse {
    data: Data;
    rawText: string
}

interface FaceDetectResponse extends BaseData {
    faceDetails: any;
}

interface Relationship {
    Type: string;
    Ids: string[];
}

const createTextractClient = (config: TextractConfig): TextractClient => {
    const credentialsProvider = fromCognitoIdentityPool({
        clientConfig: { region: config.region },
        identityPoolId: config.identityPoolId
    });
    return new TextractClient({
        region: config.region,
        credentials: credentialsProvider
    });
};

const createRekognitionClient = (config: TextractConfig): RekognitionClient => {
    const credentialsProvider = fromCognitoIdentityPool({
        clientConfig: { region: config.region },
        identityPoolId: config.identityPoolId
    });
    return new RekognitionClient({
        region: config.region,
        credentials: credentialsProvider
    });
};

const extractCountryData = (data: string): string => {
    var countryName = '';
    countries.forEach(country => {
        if (data.toLowerCase().includes(country.name.toLowerCase())) {
            countryName = country.name;
            return;
        }
    }
    );

    return countryName;
};

export const detectFace = async (buffer: Uint8Array): Promise<FaceDetectResponse> => {
    const command = new DetectFacesCommand({
        Image: {
            Bytes: buffer
        },
        Attributes: ["ALL"]
    });

    let data: FaceDetectResponse = {
        faceDetails: null,
        status: {
            code: 1,
            message: 'error',
            nextStep: ''
        }
    };

    try {
        const response = await createRekognitionClient(awsConfig).send(command);

        if (response.FaceDetails && response.FaceDetails.length > 0) {
            data.faceDetails = response.FaceDetails[0];

            if (data.faceDetails.Confidence < 80 || data.faceDetails.FaceOccluded.Value) {
                data.status.message = 'Face not detected or covered. Make sure your face is visible in the image';

                return data;
            }

            if (!data.faceDetails.EyesOpen.Value) {
                data.status.message = 'Make sure your eyes are open in the image';
                return data;
            }

            if (data.faceDetails.MouthOpen.Value) {
                data.status.message = 'Make sure your mouth is closed in the image';
                return data;
            }

            if (data.faceDetails.Eyeglasses.Value || data.faceDetails.Sunglasses.Value) {
                data.status.message = 'Make sure you are not wearing glasses or sunglasses in the image';
                return data;
            }

            data.status.code = 0;
            data.status.message = 'success';

        }
    } catch (error) {
        console.error(error);
    }

    return data;
};

export const analyzeWithTextract = async (imageBytes: Uint8Array): Promise<TextractResponse> => {
    const client = createTextractClient(awsConfig);

    try {
        const command = new AnalyzeDocumentCommand({
            Document: {
                Bytes: imageBytes
            },
            FeatureTypes: ["FORMS"]
        });

        const response = await client.send(command);

        let fullText = '';
        let extractedData: Data = {
            status: {
                code: 1,
                message: 'error',
                nextStep: ''
            }
        };

        if (response.Blocks) {

            response.Blocks.forEach(block => {
                if (block.BlockType === "LINE" && block.Text) {
                    fullText += block.Text + '\n';
                }
            });
            console.log('fullText:', fullText);
            const country = extractCountryData(fullText);
            try {
                switch (country) {
                    case 'Nigeria':
                        extractedData = processNGData(fullText);
                        break;
                    default:
                        throw new Error('Unsupported document type');
                }
            } catch (error) {
                console.error('Error:', error);
                extractedData.status.message = error instanceof Error ? error.message : 'Unknown error occurred';
            }
        }

        return { data: extractedData, rawText: fullText };
    } catch (error) {
        console.error(error);
        return {
            data: {
                status: {
                    code: 1,
                    message: 'error',
                    nextStep: ''
                }
            },
            rawText: ''
        };
    }
};

