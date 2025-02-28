import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import { DetectFacesCommand, RekognitionClient } from "@aws-sdk/client-rekognition";
import { Country, Data, FaceDetectResponse, TextractConfig, TextractResponse } from "@/app/helper/types/custom-types";
import { processNGData } from "@/app/validation/ng/processNGData";

const awsConfig = {
    region: process.env.NEXT_PUBLIC_DEFAULT_AWS_REGION || 'us-east-1',
    identityPoolId: process.env.NEXT_PUBLIC_USER_AWS_POOL_ID || 'us-east-1:8cb00b35-556e-445c-aa3d-0e8d7f3276de'
};

const idsm_url = process.env.NEXT_PUBLIC_IDSM_BASE_URL || 'http://localhost:8080';

let countriesCache: Country[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds


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
const fetchCountryData = async (): Promise<Country[]> => {
    if (countriesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        return countriesCache;
    }

    const response = await fetch(`${idsm_url}/v1/system/country`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const countries: Country[] = await response.json();

    // Update cache
    countriesCache = countries;
    cacheTimestamp = Date.now();

    return countries;
};
const extractCountryData = async (data: string): Promise<string> => {

    let countryName = '';
    try {
        const countries = await fetchCountryData();
        countries.forEach(country => {
            if (data.toLowerCase().includes(country.name.toLowerCase())) {
                countryName = country.name;
                return;
            }
        }
        );
    } catch (error) {
        console.error('Error:', error);
    }

    return countryName;
};

export const detectFace = async (buffer: Uint8Array): Promise<FaceDetectResponse> => {
    const command = new DetectFacesCommand({
        Image: {
            Bytes: buffer
        },
        Attributes: ["ALL"]
    });

    const data: FaceDetectResponse = {
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

            const faceDetails = data.faceDetails as { Confidence: number; FaceOccluded: { Value: boolean }; EyesOpen: { Value: boolean }; MouthOpen: { Value: boolean }; Eyeglasses: { Value: boolean }; Sunglasses: { Value: boolean } };
            if (faceDetails.Confidence < 80 || faceDetails.FaceOccluded.Value) {
                data.status.message = 'Face not detected or covered. Make sure your face is visible in the image';

                return data;
            }
            if (!faceDetails.EyesOpen.Value) {
                data.status.message = 'Make sure your eyes are open in the image';
                return data;
            }
            if (faceDetails.MouthOpen.Value) {
                data.status.message = 'Make sure your mouth is closed in the image';
                return data;
            }

            const faceAttributes = data.faceDetails as { Eyeglasses: { Value: boolean }; Sunglasses: { Value: boolean } };
            if (faceAttributes.Eyeglasses.Value || faceAttributes.Sunglasses.Value) {
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

            const country = await extractCountryData(fullText);
            try {
                switch (country) {
                    case 'Nigeria':
                        extractedData = processNGData(fullText);
                        break;
                    default:
                        extractedData.status.message = 'Unsupported document type';
                        //throw new Error('Unsupported document type');
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

